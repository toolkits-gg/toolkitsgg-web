import { resolveBuildOrder } from "#/features/game/data/utils";
import { requireUserId } from "#/features/user/require-user.server";
import { enforceUserWriteLimit } from "#/integrations/rate-limit/enforce-user-write-limit";
import { BuildCollectionDisplayMode, prisma } from "@/prisma";

/**
 * Ownership for membership writes is the collection's, not the build's: users
 * curate their own CARDS collections out of anyone's public builds. Variant
 * sets are the exception, and narrow this further in
 * {@link assertVariantSetEligible}.
 */
const assertOwnsCollection = async (userId: string, collectionId: string) => {
	const owned = await prisma.remnant2BuildCollection.findFirst({
		where: { id: collectionId, createdById: userId },
		select: { id: true },
	});
	if (!owned) throw new Error("Collection not found or not owned by user");
};

/**
 * Rejects members that cannot belong to a variant set, which stands for one
 * logical build rather than a curated shelf:
 *
 * 1. Every member must be authored by the set's owner.
 * 2. A build belongs to at most one variant set, so "the set this build is in"
 *    is well defined for the redirect and the feed collapse.
 *
 * Called from both write paths, so an op replayed through the sync
 * handler is checked exactly as a live write is. Errors name the offending
 * build, since the caller surfaces the message verbatim.
 *
 * Takes an optional transaction client so callers can run the check and the
 * write it guards under one serializable transaction.
 */
const assertVariantSetEligible = async (
	userId: string,
	collectionId: string,
	buildIds: string[],
	client: Pick<typeof prisma, "remnant2Build"> = prisma,
) => {
	if (buildIds.length === 0) return;

	const builds = await client.remnant2Build.findMany({
		where: { id: { in: buildIds } },
		select: {
			id: true,
			name: true,
			createdById: true,
			variantCollectionId: true,
			VariantCollection: { select: { name: true } },
		},
	});

	const foreign = builds.find((build) => build.createdById !== userId);
	if (foreign)
		throw new Error(
			`"${foreign.name}" was created by someone else. A variant set can only contain your own builds.`,
		);

	// Read from the claim column rather than the join rows: it is the same column
	// the database constrains, so this check and the write cannot disagree.
	const claimed = builds.find(
		(build) =>
			build.variantCollectionId && build.variantCollectionId !== collectionId,
	);
	if (claimed)
		throw new Error(
			`"${claimed.name}" is already a variant in "${claimed.VariantCollection?.name}". Remove it from that set first.`,
		);
};

const addBuildToOwnedCollection = async (
	userId: string,
	collectionId: string,
	buildId: string,
) => {
	await assertOwnsCollection(userId, collectionId);
	const existing = await prisma.remnant2BuildsOnCollections.findUnique({
		where: { collectionId_buildId: { collectionId, buildId } },
	});
	if (existing) return { ok: true as const };

	const collection = await prisma.remnant2BuildCollection.findUnique({
		where: { id: collectionId },
		select: { displayMode: true },
	});
	const isVariantSet =
		collection?.displayMode === BuildCollectionDisplayMode.VARIANTS;

	await prisma.$transaction(
		async (tx) => {
			// Inside the transaction, not before it: two adds racing for the same
			// build would otherwise both read "unclaimed" and both write a join row.
			if (isVariantSet)
				await assertVariantSetEligible(userId, collectionId, [buildId], tx);

			const last = await tx.remnant2BuildsOnCollections.findFirst({
				where: { collectionId },
				orderBy: { position: "desc" },
				select: { position: true },
			});
			await tx.remnant2BuildsOnCollections.create({
				data: { collectionId, buildId, position: (last?.position ?? -1) + 1 },
			});
			await tx.remnant2Build.update({
				where: { id: buildId },
				data: {
					collectionCount: { increment: 1 },
					// The claim column moves in the same transaction as the membership row
					// it mirrors, so the two can never disagree about which set owns a build.
					...(isVariantSet ? { variantCollectionId: collectionId } : {}),
				},
			});
		},
		// Serializable only where it buys something: it makes the read-then-write
		// above safe against a concurrent add. Card collections have no such rule
		// and keep the default isolation.
		isVariantSet ? { isolationLevel: "Serializable" } : undefined,
	);
	return { ok: true as const };
};

const removeBuildFromOwnedCollection = async (
	userId: string,
	collectionId: string,
	buildId: string,
) => {
	await assertOwnsCollection(userId, collectionId);
	const existing = await prisma.remnant2BuildsOnCollections.findUnique({
		where: { collectionId_buildId: { collectionId, buildId } },
	});
	if (!existing) return { ok: true as const };

	await prisma.$transaction([
		prisma.remnant2BuildsOnCollections.delete({
			where: { collectionId_buildId: { collectionId, buildId } },
		}),
		prisma.remnant2Build.update({
			where: { id: buildId },
			data: { collectionCount: { decrement: 1 } },
		}),
		// Scoped to this collection, so removing a build from an unrelated CARDS
		// collection cannot release the variant set that actually claims it.
		prisma.remnant2Build.updateMany({
			where: { id: buildId, variantCollectionId: collectionId },
			data: { variantCollectionId: null },
		}),
	]);
	return { ok: true as const };
};

/**
 * Rewrites member positions so they match `buildIds`.
 *
 * The collection row is touched in the same transaction: its `updatedAt` is the
 * baseline the sync handler compares against, and Prisma will not bump
 * it for a write that only lands on the join rows.
 */
const setOwnedCollectionBuildOrder = async (
	userId: string,
	collectionId: string,
	buildIds: string[],
) => {
	await assertOwnsCollection(userId, collectionId);
	const members = await prisma.remnant2BuildsOnCollections.findMany({
		where: { collectionId },
		orderBy: { position: "asc" },
		select: { buildId: true },
	});
	const ordered = resolveBuildOrder(
		members.map((member) => member.buildId),
		buildIds,
	);

	await prisma.$transaction([
		...ordered.map((buildId, position) =>
			prisma.remnant2BuildsOnCollections.update({
				where: { collectionId_buildId: { collectionId, buildId } },
				data: { position },
			}),
		),
		prisma.remnant2BuildCollection.update({
			where: { id: collectionId },
			data: { updatedAt: new Date() },
		}),
	]);
	return { ok: true as const };
};

/** Ids of the acting user's collections that contain a build. */
const listCollectionIdsForBuild = async (
	buildId: string,
): Promise<string[]> => {
	const userId = await requireUserId();
	const rows = await prisma.remnant2BuildsOnCollections.findMany({
		where: { buildId, Collection: { createdById: userId } },
		select: { collectionId: true },
	});
	return rows.map((row) => row.collectionId);
};

const addBuildToCollection = async (collectionId: string, buildId: string) => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	return addBuildToOwnedCollection(userId, collectionId, buildId);
};

const removeBuildFromCollection = async (
	collectionId: string,
	buildId: string,
) => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	return removeBuildFromOwnedCollection(userId, collectionId, buildId);
};

const setCollectionBuildOrder = async (
	collectionId: string,
	buildIds: string[],
) => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	return setOwnedCollectionBuildOrder(userId, collectionId, buildIds);
};

export {
	addBuildToCollection,
	addBuildToOwnedCollection,
	assertOwnsCollection,
	assertVariantSetEligible,
	listCollectionIdsForBuild,
	removeBuildFromCollection,
	removeBuildFromOwnedCollection,
	setCollectionBuildOrder,
	setOwnedCollectionBuildOrder,
};
