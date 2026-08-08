import { hasViewerCapability } from "#/features/auth/require-capability.server";
import type {
	BuildCollectionRecord,
	BuildCollectionSummary,
	CreateBuildCollectionInput,
	CreatedBuildSummary,
	UpdateBuildCollectionInput,
} from "#/features/game/data/types";
import { HIDDEN_MODERATOR_STATUSES } from "#/features/moderation/build-status.server";
import { requireUserId } from "#/features/user/require-user.server";
import { assertVariantSetEligible } from "#/games/remnant2/data/build-collections/build-collection-members.server";
import { attachVariantSets } from "#/games/remnant2/data/build-collections/build-variant-sets.server";
import { enforceUserWriteLimit } from "#/integrations/rate-limit/enforce-user-write-limit";
import {
	type BuildCollectionDisplayMode,
	BuildVisibility,
	prisma,
	type Remnant2BuildCollection,
} from "@/prisma";

type CollectionWriteFields = {
	name?: string;
	description?: string | null;
	visibility?: BuildVisibility;
	displayMode?: BuildCollectionDisplayMode;
};

type CollectionWithCount = Remnant2BuildCollection & {
	_count: { Builds: number };
};

const toCollectionSummary = (
	collection: CollectionWithCount,
): BuildCollectionSummary => {
	const { _count, ...rest } = collection;
	return { ...rest, buildCount: _count.Builds };
};

/**
 * Creates a collection under a client generated id.
 * Upsert rather than create so a replayed queued op
 * lands on the row it already created.
 */
const createOwnedCollection = async (
	userId: string,
	collectionId: string,
	fields: CollectionWriteFields & { name: string },
): Promise<BuildCollectionSummary> => {
	const created = await prisma.remnant2BuildCollection.upsert({
		where: { id: collectionId },
		update: {},
		create: { ...fields, id: collectionId, createdById: userId },
		include: { _count: { select: { Builds: true } } },
	});
	return toCollectionSummary(created);
};

const updateOwnedCollection = async (
	userId: string,
	collectionId: string,
	fields: CollectionWriteFields,
): Promise<BuildCollectionSummary> => {
	// Turning a collection into a variant set retroactively subjects every member
	// to the variant rules, so they are checked before the flip lands.
	const memberIds =
		fields.displayMode === undefined
			? []
			: (
					await prisma.remnant2BuildsOnCollections.findMany({
						where: { collectionId },
						select: { buildId: true },
					})
				).map((member) => member.buildId);

	const updated = await prisma.$transaction(
		async (tx) => {
			// Checked inside the transaction so a build cannot be claimed by another
			// set between the check and the flip.
			if (fields.displayMode === "VARIANTS")
				await assertVariantSetEligible(userId, collectionId, memberIds, tx);

			// updateMany lets us scope by createdById (ownership) in the where clause.
			const res = await tx.remnant2BuildCollection.updateMany({
				where: { id: collectionId, createdById: userId },
				data: fields,
			});
			if (res.count === 0)
				throw new Error("Collection not found or not owned by user");

			// The claim column follows the flip in the same transaction: becoming a
			// variant set claims every member, and dropping to CARDS releases them so
			// each build is free to join a set elsewhere.
			if (fields.displayMode === "VARIANTS")
				await tx.remnant2Build.updateMany({
					where: { id: { in: memberIds } },
					data: { variantCollectionId: collectionId },
				});
			else if (fields.displayMode === "CARDS")
				await tx.remnant2Build.updateMany({
					where: { variantCollectionId: collectionId },
					data: { variantCollectionId: null },
				});

			return tx.remnant2BuildCollection.findUnique({
				where: { id: collectionId },
				include: { _count: { select: { Builds: true } } },
			});
		},
		fields.displayMode === "VARIANTS"
			? { isolationLevel: "Serializable" }
			: undefined,
	);

	if (!updated) throw new Error("Collection not found after update");
	return toCollectionSummary(updated);
};

const deleteOwnedCollection = async (userId: string, collectionId: string) => {
	await prisma.remnant2BuildCollection.deleteMany({
		where: { id: collectionId, createdById: userId },
	});
	return { ok: true as const };
};

const listCollections = async (): Promise<BuildCollectionSummary[]> => {
	const userId = await requireUserId();
	const rows = await prisma.remnant2BuildCollection.findMany({
		where: { createdById: userId },
		orderBy: { updatedAt: "desc" },
		include: { _count: { select: { Builds: true } } },
	});
	return rows.map(toCollectionSummary);
};

const listCollectionsByUserId = async (
	userId: string,
): Promise<BuildCollectionSummary[]> => {
	const rows = await prisma.remnant2BuildCollection.findMany({
		where: {
			createdById: userId,
			visibility: BuildVisibility.PUBLIC,
			moderatorStatus: { notIn: HIDDEN_MODERATOR_STATUSES },
		},
		orderBy: { updatedAt: "desc" },
		include: { _count: { select: { Builds: true } } },
	});
	return rows.map(toCollectionSummary);
};

/**
 * Reads a collection with its ordered builds. A PRIVATE collection is only
 * returned to its owner; a non-owner never sees PRIVATE builds
 * inside an otherwise-visible collection.
 */
const getCollectionById = async (
	collectionId: string,
	viewerId: string | null,
): Promise<BuildCollectionRecord | null> => {
	const collection = await prisma.remnant2BuildCollection.findUnique({
		where: { id: collectionId },
		include: {
			_count: { select: { Builds: true } },
			Builds: {
				orderBy: { position: "asc" },
				include: { Build: true },
			},
		},
	});
	if (!collection) return null;

	const isOwner = !!viewerId && collection.createdById === viewerId;
	if (!isOwner && collection.visibility === BuildVisibility.PRIVATE) {
		if (!(await hasViewerCapability("build:moderate", "remnant2"))) return null;
	}

	const { Builds, ...rest } = collection;
	const visible = Builds.map((row) => row.Build).filter(
		(build) =>
			isOwner ||
			build.visibility !== BuildVisibility.PRIVATE ||
			build.createdById === viewerId,
	);
	const builds: CreatedBuildSummary[] = await attachVariantSets(
		visible,
		viewerId,
	);

	return { ...toCollectionSummary(rest), builds };
};

const createCollection = async (
	input: CreateBuildCollectionInput,
): Promise<BuildCollectionSummary> => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	return createOwnedCollection(userId, input.collectionId, {
		name: input.name,
		description: input.description,
		visibility: input.visibility,
		displayMode: input.displayMode,
	});
};

const updateCollection = async (
	input: UpdateBuildCollectionInput,
): Promise<BuildCollectionSummary> => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	const { collectionId, ...fields } = input;
	return updateOwnedCollection(userId, collectionId, fields);
};

const deleteCollection = async (collectionId: string) => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	return deleteOwnedCollection(userId, collectionId);
};

export type { CollectionWriteFields };
export {
	createCollection,
	createOwnedCollection,
	deleteCollection,
	deleteOwnedCollection,
	getCollectionById,
	listCollections,
	listCollectionsByUserId,
	updateCollection,
	updateOwnedCollection,
};
