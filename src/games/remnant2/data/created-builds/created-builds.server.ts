import { hasViewerCapability } from "#/features/auth/require-capability.server";
import type {
	BuildLoadoutEntry,
	BuildRelationFields,
	BuildWriteFields,
	CreateBuildInput,
	CreatedBuildRecord,
	CreatedBuildSummary,
} from "#/features/game/data/types";
import { wasModeratorDeleted } from "#/features/moderation/audit.server";
import { HIDDEN_MODERATOR_STATUSES } from "#/features/moderation/build-status.server";
import type { BuildSnapshot } from "#/features/moderation/review-diff";
import { needsReview } from "#/features/moderation/review-diff";
import {
	fileBuildReview,
	fromJsonSnapshot,
	SNAPSHOT_SELECT,
	toSnapshot,
	withdrawOpenReviews,
} from "#/features/moderation/review-items.server";
import { requireUserId } from "#/features/user/require-user.server";
import {
	assertOwnsCollection,
	assertVariantSetEligible,
} from "#/games/remnant2/data/build-collections/build-collection-members.server";
import { attachVariantSets } from "#/games/remnant2/data/build-collections/build-variant-sets.server";
import { enforceUserWriteLimit } from "#/integrations/rate-limit/enforce-user-write-limit";
import {
	BuildModeratorStatus,
	BuildVisibility,
	type GameId,
	type ModerationReviewReason,
	prisma,
} from "@/prisma";

const REMNANT2: GameId = "remnant2";

type BuildUpdateData = Omit<BuildWriteFields, "visibility"> & {
	visibility?: BuildVisibility;
};

type PrismaTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

const BUILD_RELATION_SELECT = {
	BuildItems: {
		select: { itemId: true, level: true, amount: true, optional: true },
	},
	BuildTags: { select: { tag: true } },
} as const;

type BuildWithRelations = {
	BuildItems: BuildLoadoutEntry[];
	BuildTags: { tag: string }[];
};

/** Projects the game's join rows onto the app-level loadout/tags shape. */
const toBuildRecord = <T extends BuildWithRelations>(
	build: T,
): CreatedBuildRecord => {
	const { BuildItems, BuildTags, ...rest } = build;
	return {
		...(rest as unknown as CreatedBuildSummary),
		loadout: BuildItems,
		tags: BuildTags.map((t) => t.tag),
	};
};

/**
 * Rewrites a build's join rows to exactly match the input, and re-derives
 * `itemCount` from the result.
 *
 * Relations left undefined are not touched, so a
 * patch-style update can edit without clearing the loadout.
 */
const replaceBuildRelations = async (
	tx: PrismaTx,
	buildId: string,
	relations: BuildRelationFields,
): Promise<void> => {
	if (relations.loadout !== undefined) {
		await tx.remnant2BuildItem.deleteMany({ where: { buildId } });
		if (relations.loadout.length > 0) {
			await tx.remnant2BuildItem.createMany({
				data: relations.loadout.map((entry) => ({
					buildId,
					itemId: entry.itemId,
					level: entry.level ?? 1,
					amount: entry.amount ?? null,
					optional: entry.optional ?? false,
				})),
			});
		}
		await tx.remnant2Build.update({
			where: { id: buildId },
			data: { itemCount: relations.loadout.length },
		});
	}

	if (relations.tags !== undefined) {
		await tx.remnant2BuildTag.deleteMany({ where: { buildId } });
		if (relations.tags.length > 0) {
			await tx.remnant2BuildTag.createMany({
				data: relations.tags.map((tag) => ({ buildId, tag })),
			});
		}
	}
};

/**
 * Creates a build under a client-minted id. Uses an upsert so a replayed queued
 * create op lands on the row it already created rather than failing on the key.
 */
const createOwnedBuild = async (
	userId: string,
	input: CreateBuildInput,
	fields: BuildWriteFields,
	relations: BuildRelationFields,
): Promise<CreatedBuildRecord> =>
	prisma.$transaction(async (tx) => {
		// A queue drained after a takedown still holds writes for the
		// deleted build, and the create branch of the sync handler would put it
		// back. The moderator's decision outranks the stale op.
		if (await wasModeratorDeleted(tx, "BUILD", input.buildId)) {
			throw new Error("Build was removed by a moderator");
		}

		await tx.remnant2Build.upsert({
			where: { id: input.buildId },
			update: {},
			create: {
				...(fields as BuildUpdateData),
				id: input.buildId,
				createdById: userId,
				name: fields.name ?? input.name,
			},
		});
		await replaceBuildRelations(tx, input.buildId, relations);
		const created = await tx.remnant2Build.findUnique({
			where: { id: input.buildId },
			include: BUILD_RELATION_SELECT,
		});
		if (!created) throw new Error("Build not found after create");

		// The build is already live at this point; this only enqueues the work.
		if (needsReview(created.visibility)) {
			await fileBuildReview({
				tx,
				gameId: REMNANT2,
				buildId: created.id,
				authorId: userId,
				reason: "NEW_BUILD",
				previous: null,
				next: toSnapshot(created),
			});
		}

		return toBuildRecord(created);
	});

/**
 * What put the build in front of a moderator. Reaching the public leads over a
 * routine edit: the moderator is being asked to clear content for an audience
 * that could not see it a moment ago, which is the stronger claim on attention.
 */
const reviewReason = (
	lastReviewed: BuildSnapshot | null,
	previousVisibility: string,
): ModerationReviewReason => {
	if (lastReviewed === null) return "NEW_BUILD";
	return needsReview(previousVisibility) ? "EDITED" : "PUBLISHED";
};

const updateOwnedBuild = async (
	userId: string,
	buildId: string,
	fields: BuildWriteFields,
	relations: BuildRelationFields = {},
): Promise<CreatedBuildRecord> =>
	prisma.$transaction(async (tx) => {
		const before = await tx.remnant2Build.findUnique({
			where: { id: buildId },
			select: {
				...SNAPSHOT_SELECT,
				moderatorStatus: true,
				lastReviewedSnapshot: true,
			},
		});
		if (before?.moderatorStatus === BuildModeratorStatus.LOCKED) {
			throw new Error("Build is locked by a moderator and cannot be edited");
		}

		// updateMany lets us scope by createdById (ownership) in the where clause.
		const res = await tx.remnant2Build.updateMany({
			where: { id: buildId, createdById: userId },
			data: fields as BuildUpdateData,
		});
		if (res.count === 0)
			throw new Error("Build not found or not owned by user");
		await replaceBuildRelations(tx, buildId, relations);
		const updated = await tx.remnant2Build.findUnique({
			where: { id: buildId },
			include: BUILD_RELATION_SELECT,
		});
		if (!updated) throw new Error("Build not found after update");

		// Edits go live immediately and are reviewed afterwards, so this never
		// touches `moderatorStatus` - only a moderator moves that.
		//
		// A build nobody can see yet is not a build anyone needs to review, so
		// going private withdraws the pending work rather than leaving a card up
		// for content the public cannot reach.
		if (!needsReview(updated.visibility)) {
			await withdrawOpenReviews(tx, "BUILD", buildId);
		} else if (before) {
			const lastReviewed = fromJsonSnapshot(before.lastReviewedSnapshot);
			await fileBuildReview({
				tx,
				gameId: REMNANT2,
				buildId,
				authorId: userId,
				reason: reviewReason(lastReviewed, before.visibility),
				previous: lastReviewed,
				next: toSnapshot(updated),
			});
		}

		return toBuildRecord(updated);
	});

const listBuilds = async (): Promise<CreatedBuildSummary[]> => {
	const userId = await requireUserId();
	const rows = await prisma.remnant2Build.findMany({
		where: { createdById: userId },
		orderBy: { updatedAt: "desc" },
	});
	return attachVariantSets(rows, userId);
};

/**
 * Reads a build, enforcing visibility: a PRIVATE build is only ever returned to
 * its owner.
 *
 * Returning null rather than throwing lets the route render a 404
 * without leaking that the id exists.
 */
const getBuildById = async (
	buildId: string,
	viewerId: string | null,
): Promise<CreatedBuildRecord | null> => {
	const build = await prisma.remnant2Build.findUnique({
		where: { id: buildId },
		include: BUILD_RELATION_SELECT,
	});
	if (!build) return null;
	const isOwner = !!viewerId && build.createdById === viewerId;
	// The capability check is inside the branch so the ordinary read path never
	// pays for it.
	if (!isOwner && build.visibility === BuildVisibility.PRIVATE) {
		if (!(await hasViewerCapability("build:moderate", REMNANT2))) return null;
	}

	const upvotedByViewer = viewerId
		? !!(await prisma.remnant2BuildUpvote.findUnique({
				where: { buildId_userId: { buildId, userId: viewerId } },
			}))
		: false;

	const [annotated] = await attachVariantSets(
		[{ ...toBuildRecord(build), upvotedByViewer }],
		viewerId,
	);
	return annotated;
};

const listBuildsByUserId = async (
	userId: string,
	viewerId: string | null,
): Promise<CreatedBuildSummary[]> => {
	const rows = await prisma.remnant2Build.findMany({
		where: {
			createdById: userId,
			visibility: BuildVisibility.PUBLIC,
			moderatorStatus: { notIn: HIDDEN_MODERATOR_STATUSES },
		},
		orderBy: { updatedAt: "desc" },
	});
	return attachVariantSets(rows, viewerId);
};

const createBuild = async (
	input: CreateBuildInput,
	fields: BuildWriteFields,
	relations: BuildRelationFields,
): Promise<CreatedBuildRecord> => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	return createOwnedBuild(userId, input, fields, relations);
};

const updateBuild = async (
	buildId: string,
	fields: BuildWriteFields,
	relations: BuildRelationFields,
): Promise<CreatedBuildRecord> => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	return updateOwnedBuild(userId, buildId, fields, relations);
};

/**
 * Copies a build into a variant set in one transaction, so the copy never exists
 * outside the set it was made for. This is what makes the operation atomic for a
 * queued duplicate too: the sync handler replays this single call rather
 * than a create and an add that could land apart.
 *
 * Everything the editor can set is carried over, including the description and
 * visibility that a URL-based clone would drop. The copy lands last, and
 * `duplicateCount` on the source records that it was branched from.
 *
 * Replay-safe: the copy's id is client-minted, so a second delivery of the same
 * op finds the row already there and returns it untouched rather than making a
 * third build or double-counting the source.
 */
const duplicateOwnedBuild = async (
	userId: string,
	sourceBuildId: string,
	newBuildId: string,
	collectionId: string,
): Promise<CreatedBuildRecord> => {
	const alreadyCopied = await prisma.remnant2Build.findUnique({
		where: { id: newBuildId },
		include: BUILD_RELATION_SELECT,
	});
	if (alreadyCopied) return toBuildRecord(alreadyCopied);

	await assertOwnsCollection(userId, collectionId);

	const source = await prisma.remnant2Build.findFirst({
		where: { id: sourceBuildId, createdById: userId },
		include: BUILD_RELATION_SELECT,
	});
	if (!source) throw new Error("Build not found or not owned by user");
	// A lock blocks editing, and copying is editing by another name: without this
	// the copy would come back unlocked and carry the locked content forward.
	if (source.moderatorStatus === BuildModeratorStatus.LOCKED) {
		throw new Error("Build is locked by a moderator and cannot be duplicated");
	}

	const collection = await prisma.remnant2BuildCollection.findUnique({
		where: { id: collectionId },
		select: { displayMode: true },
	});
	const isVariantSet = collection?.displayMode === "VARIANTS";

	return prisma.$transaction(async (tx) => {
		// The source must still be eligible: the copy inherits the set, and the
		// source may have been claimed elsewhere since the editor loaded it.
		await assertVariantSetEligible(userId, collectionId, [sourceBuildId], tx);

		const last = await tx.remnant2BuildsOnCollections.findFirst({
			where: { collectionId },
			orderBy: { position: "desc" },
			select: { position: true },
		});

		await tx.remnant2Build.create({
			data: {
				id: newBuildId,
				createdById: userId,
				name: `${source.name} (copy)`,
				description: source.description,
				visibility: source.visibility,
				videoUrl: source.videoUrl,
				referenceUrl: source.referenceUrl,
				gameVersion: source.gameVersion,
				itemCount: source.BuildItems.length,
				collectionCount: 1,
				variantCollectionId: isVariantSet ? collectionId : null,
			},
		});
		await replaceBuildRelations(tx, newBuildId, {
			loadout: source.BuildItems,
			tags: source.BuildTags.map((row) => row.tag),
		});
		await tx.remnant2BuildsOnCollections.create({
			data: {
				collectionId,
				buildId: newBuildId,
				position: (last?.position ?? -1) + 1,
			},
		});
		await tx.remnant2Build.update({
			where: { id: sourceBuildId },
			data: { duplicateCount: { increment: 1 } },
		});

		const created = await tx.remnant2Build.findUnique({
			where: { id: newBuildId },
			include: BUILD_RELATION_SELECT,
		});
		if (!created) throw new Error("Build not found after duplicate");

		// The copy is its own build with its own id and no reviewed baseline, so
		// however well vetted the source was, this content has never been cleared
		// under the id the public will reach it by.
		if (needsReview(created.visibility)) {
			await fileBuildReview({
				tx,
				gameId: REMNANT2,
				buildId: newBuildId,
				authorId: userId,
				reason: "NEW_BUILD",
				previous: null,
				next: toSnapshot(created),
			});
		}

		return toBuildRecord(created);
	});
};

const duplicateBuild = async (
	sourceBuildId: string,
	newBuildId: string,
	collectionId: string,
): Promise<CreatedBuildRecord> => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	return duplicateOwnedBuild(userId, sourceBuildId, newBuildId, collectionId);
};

const deleteBuild = async (buildId: string) => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	await prisma.remnant2Build.deleteMany({
		where: { id: buildId, createdById: userId },
	});
	return { ok: true as const };
};

/**
 * Records a deduped view. `viewCount` counts raw hits while `validatedViewCount`
 * tracks distinct viewers, so the latter only moves when the view row is new.
 */
const recordBuildView = async (buildId: string, viewerKey: string) => {
	const existing = await prisma.remnant2BuildView.findUnique({
		where: { buildId_viewerKey: { buildId, viewerKey } },
	});
	await prisma.remnant2BuildView.upsert({
		where: { buildId_viewerKey: { buildId, viewerKey } },
		update: {},
		create: { buildId, viewerKey },
	});
	await prisma.remnant2Build.update({
		where: { id: buildId },
		data: {
			viewCount: { increment: 1 },
			...(existing ? {} : { validatedViewCount: { increment: 1 } }),
		},
	});
	return { ok: true as const };
};

export type { BuildUpdateData, PrismaTx };
export {
	createBuild,
	createOwnedBuild,
	deleteBuild,
	duplicateBuild,
	duplicateOwnedBuild,
	getBuildById,
	listBuilds,
	listBuildsByUserId,
	recordBuildView,
	replaceBuildRelations,
	updateBuild,
	updateOwnedBuild,
};
