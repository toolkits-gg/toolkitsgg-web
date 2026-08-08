import { requireCapability } from "#/features/auth/require-capability.server";
import type {
	ModerationAuditRow,
	ModerationResolution,
	ModerationReviewRow,
} from "#/features/game/data/types";
import { logModerationAction } from "#/features/moderation/audit.server";
import { groupOpenReviews } from "#/features/moderation/group-open-reviews";
import {
	fromJsonSnapshot,
	type PrismaTx,
	resolveOpenReviews,
	SNAPSHOT_SELECT,
	toSnapshot,
} from "#/features/moderation/review-items.server";
import { buildFieldDiffs } from "#/features/moderation/text-diff";
import type { HideUserContent } from "#/features/moderation/user-content.server";
import { enforceUserWriteLimit } from "#/integrations/rate-limit/enforce-user-write-limit";
import {
	BuildModeratorStatus,
	BuildVisibility,
	type GameId,
	type ModerationActionType,
	type ModerationReviewStatus,
	type Prisma,
	prisma,
	type Remnant2BuildFeed,
} from "@/prisma";

const REMNANT2: GameId = "remnant2";
const BUILD = "BUILD" as const;
const QUEUE_PAGE_SIZE = 100;

const BUILD_SUMMARY_SELECT = {
	id: true,
	name: true,
	visibility: true,
	moderatorStatus: true,
	description: true,
	videoUrl: true,
	referenceUrl: true,
} as const;

/**
 * The queue renders a diff, not the build, so it deliberately leaves the text
 * columns behind: a description is up to 5k characters and the card never shows
 * one whole.
 */
const QUEUE_BUILD_SELECT = {
	id: true,
	name: true,
	visibility: true,
	moderatorStatus: true,
} as const;

/**
 * Each resolution maps to the state the build ends in, the capability it costs,
 * and how the review item closes. DISMISS is the "nothing wrong here" path:
 * it closes the item without touching the build at all.
 */
const RESOLUTIONS = {
	APPROVE: {
		capability: "build:moderate",
		action: "APPROVE",
		status: BuildModeratorStatus.APPROVED,
		reviewStatus: "RESOLVED",
	},
	DISMISS: {
		capability: "build:moderate",
		action: "DISMISS",
		status: null,
		reviewStatus: "DISMISSED",
	},
	SET_PRIVATE: {
		capability: "build:moderate",
		action: "SET_PRIVATE",
		status: BuildModeratorStatus.REJECTED,
		reviewStatus: "RESOLVED",
	},
	LOCK: {
		capability: "build:lock",
		action: "LOCK",
		status: BuildModeratorStatus.LOCKED,
		reviewStatus: "RESOLVED",
	},
	UNLOCK: {
		capability: "build:lock",
		action: "UNLOCK",
		status: BuildModeratorStatus.PENDING,
		reviewStatus: "RESOLVED",
	},
	DELETE: {
		capability: "build:delete",
		action: "DELETE",
		status: null,
		reviewStatus: "RESOLVED",
	},
} as const satisfies Record<
	ModerationResolution,
	{
		capability: Parameters<typeof requireCapability>[0];
		action: ModerationActionType;
		status: BuildModeratorStatus | null;
		reviewStatus: ModerationReviewStatus;
	}
>;

/**
 * Writes to a build as a moderator, leaving `updatedAt` where it was.
 *
 * `@updatedAt` is stamped by Prisma on any update, but the column means "when
 * the author last touched this": it orders the author's own build list and seeds
 * last-write-wins during sync. A takedown is not an edit the author made, so
 * passing the old value explicitly overrides the automatic stamp.
 */
const updateBuildAsModerator = (
	tx: PrismaTx,
	buildId: string,
	updatedAt: Date,
	data: Prisma.Remnant2BuildUncheckedUpdateInput,
) =>
	tx.remnant2Build.update({
		where: { id: buildId },
		data: { ...data, updatedAt },
	});

/**
 * Records the build as a moderator has now seen it, which is the baseline the
 * author's next edit diffs against. Every resolution advances it, including
 * DISMISS: "nothing wrong here" still means they looked. So do the moderator's
 * own content edits, which file no review of their own and would otherwise
 * surface as the author's changes the next time the author touched anything.
 */
const markBuildReviewed = async (tx: PrismaTx, buildId: string) => {
	const build = await tx.remnant2Build.findUnique({
		where: { id: buildId },
		select: { ...SNAPSHOT_SELECT, updatedAt: true },
	});
	if (!build) return;

	await updateBuildAsModerator(tx, buildId, build.updatedAt, {
		lastReviewedSnapshot: toSnapshot(build),
	});
};

const AUTHOR_SELECT = {
	select: {
		id: true,
		username: true,
		displayUsername: true,
		UserProfile: { select: { displayName: true } },
	},
} as const;

/**
 * Open rows for one build are one card, so the page has to be a page of builds
 * rather than of rows: taking 100 rows could cut a group in half and lose the
 * oldest row that holds its baseline.
 */
const listOpenItems = async () => {
	const targets = await prisma.moderationReviewItem.groupBy({
		by: ["targetId"],
		where: { gameId: REMNANT2, targetType: BUILD, status: "OPEN" },
		_max: { createdAt: true },
		orderBy: { _max: { createdAt: "desc" } },
		take: QUEUE_PAGE_SIZE,
	});

	return prisma.moderationReviewItem.findMany({
		where: {
			gameId: REMNANT2,
			targetType: BUILD,
			status: "OPEN",
			targetId: { in: targets.map((target) => target.targetId) },
		},
		orderBy: [{ createdAt: "desc" }, { id: "desc" }],
		include: { Author: AUTHOR_SELECT },
	});
};

const listReviewQueue = async (
	status: ModerationReviewStatus,
): Promise<ModerationReviewRow[]> => {
	await requireCapability("build:moderate", REMNANT2);

	const items =
		status === "OPEN"
			? await listOpenItems()
			: await prisma.moderationReviewItem.findMany({
					where: { gameId: REMNANT2, targetType: BUILD, status },
					orderBy: [{ createdAt: "desc" }, { id: "desc" }],
					take: QUEUE_PAGE_SIZE,
					include: { Author: AUTHOR_SELECT },
				});

	const normalised = items.map((item) => ({
		...item,
		previous: fromJsonSnapshot(item.previousSnapshot),
		current: fromJsonSnapshot(item.currentSnapshot),
	}));

	// Resolved rows are distinct review cycles for the same build, so only the
	// open view collapses them.
	const groups =
		status === "OPEN"
			? groupOpenReviews(normalised)
			: normalised.map((item) => ({ ...item, itemIds: [item.id] }));

	// The target is a plain id rather than a relation (the log has to outlive
	// deletes), so the builds come back in one follow-up query.
	const builds = await prisma.remnant2Build.findMany({
		where: { id: { in: groups.map((group) => group.targetId) } },
		select: QUEUE_BUILD_SELECT,
	});
	const buildById = new Map(builds.map((build) => [build.id, build]));

	return groups.map((group) => ({
		id: group.id,
		createdAt: group.createdAt,
		updatedAt: group.updatedAt,
		gameId: group.gameId,
		targetId: group.targetId,
		reason: group.reason,
		status: group.status,
		changedFields: [...group.changedFields],
		fieldDiffs: buildFieldDiffs({
			changedFields: group.changedFields,
			previous: group.previous,
			current: group.current,
		}),
		currentName: group.current?.name ?? null,
		currentVideoUrl: group.current?.videoUrl ?? null,
		author: group.Author
			? {
					id: group.Author.id,
					username: group.Author.displayUsername ?? group.Author.username,
					displayName: group.Author.UserProfile?.displayName ?? null,
				}
			: null,
		build: buildById.get(group.targetId) ?? null,
	}));
};

/** Counts builds awaiting review, not rows, so it agrees with the queue. */
const countOpenReviews = async (): Promise<number> => {
	await requireCapability("build:moderate", REMNANT2);
	const targets = await prisma.moderationReviewItem.groupBy({
		by: ["targetId"],
		where: { gameId: REMNANT2, status: "OPEN" },
	});
	return targets.length;
};

const listAuditLog = async (
	targetId?: string,
): Promise<ModerationAuditRow[]> => {
	await requireCapability("audit:read", REMNANT2);

	const rows = await prisma.moderationAction.findMany({
		where: { gameId: REMNANT2, ...(targetId ? { targetId } : {}) },
		orderBy: [{ createdAt: "desc" }, { id: "desc" }],
		take: QUEUE_PAGE_SIZE,
		include: {
			Actor: { select: { id: true, username: true, displayUsername: true } },
		},
	});

	return rows.map((row) => ({
		id: row.id,
		createdAt: row.createdAt,
		gameId: row.gameId,
		action: row.action,
		targetType: row.targetType,
		targetId: row.targetId,
		previousValue: row.previousValue,
		newValue: row.newValue,
		reason: row.reason,
		actor: row.Actor
			? {
					id: row.Actor.id,
					username: row.Actor.displayUsername ?? row.Actor.username,
				}
			: null,
	}));
};

/**
 * Applies a moderator's decision to a build and closes every open review for it.
 * The build change, the review resolutions, and the audit row all land in one
 * transaction, which is what guarantees a DELETE cannot leave the log without
 * its entry.
 *
 * Resolution is per build rather than per row because the queue shows one card
 * per build: closing only the row the card was keyed to would leave its
 * siblings open.
 */
const applyBuildAction = async (
	buildId: string,
	resolution: ModerationResolution,
	reason: string | undefined,
) => {
	const config = RESOLUTIONS[resolution];
	const actorId = await requireCapability(config.capability, REMNANT2);
	await enforceUserWriteLimit(actorId);

	await prisma.$transaction(async (tx) => {
		const before = await tx.remnant2Build.findUnique({
			where: { id: buildId },
			select: { moderatorStatus: true, visibility: true, updatedAt: true },
		});
		if (!before) throw new Error("Build not found");

		if (resolution === "DELETE") {
			await tx.remnant2Build.delete({ where: { id: buildId } });
		} else if (config.status !== null) {
			await updateBuildAsModerator(tx, buildId, before.updatedAt, {
				moderatorStatus: config.status,
				// Taking something down means taking it out of public view, not
				// just flagging it.
				...(resolution === "SET_PRIVATE" || resolution === "LOCK"
					? { visibility: BuildVisibility.PRIVATE }
					: {}),
			});
		}

		await resolveOpenReviews(
			tx,
			BUILD,
			[buildId],
			actorId,
			config.reviewStatus,
		);
		if (resolution !== "DELETE") await markBuildReviewed(tx, buildId);

		await logModerationAction({
			tx,
			actorId,
			gameId: REMNANT2,
			action: config.action,
			targetType: BUILD,
			targetId: buildId,
			previousValue: before.moderatorStatus,
			newValue: config.status,
			reason,
		});
	});

	return { ok: true as const };
};

/**
 * Strips an offending field instead of actioning the whole build, for the case
 * where the build is fine but its video or description is not.
 */
const moderateBuildContent = async (args: {
	buildId: string;
	clearVideo?: boolean;
	clearDescription?: boolean;
	reason?: string;
}) => {
	const actorId = await requireCapability("build:moderate", REMNANT2);
	await enforceUserWriteLimit(actorId);

	await prisma.$transaction(async (tx) => {
		const before = await tx.remnant2Build.findUnique({
			where: { id: args.buildId },
			select: { videoUrl: true, description: true, updatedAt: true },
		});
		if (!before) throw new Error("Build not found");

		if (args.clearVideo) {
			await updateBuildAsModerator(tx, args.buildId, before.updatedAt, {
				videoUrl: null,
			});
			await logModerationAction({
				tx,
				actorId,
				gameId: REMNANT2,
				action: "CLEAR_VIDEO",
				targetType: BUILD,
				targetId: args.buildId,
				previousValue: before.videoUrl,
				reason: args.reason,
			});
		}

		if (args.clearDescription) {
			await updateBuildAsModerator(tx, args.buildId, before.updatedAt, {
				description: null,
			});
			await logModerationAction({
				tx,
				actorId,
				gameId: REMNANT2,
				action: "CLEAR_DESCRIPTION",
				targetType: BUILD,
				targetId: args.buildId,
				previousValue: before.description,
				reason: args.reason,
			});
		}

		if (args.clearVideo || args.clearDescription)
			await markBuildReviewed(tx, args.buildId);
	});

	return { ok: true as const };
};

/**
 * Edits a build the moderator does not own, so it deliberately omits the
 * `createdById` scoping that the owner update path relies on. Files no review
 * item: a moderator reviewing their own edit would loop forever.
 */
const moderatorUpdateBuild = async (args: {
	buildId: string;
	name?: string;
	description?: string | null;
	videoUrl?: string | null;
	referenceUrl?: string | null;
	reason?: string;
}) => {
	const actorId = await requireCapability("build:moderate", REMNANT2);
	await enforceUserWriteLimit(actorId);

	const { buildId, reason, ...fields } = args;
	const changed = Object.entries(fields).filter(
		([, value]) => value !== undefined,
	);
	if (changed.length === 0) return { ok: true as const };

	await prisma.$transaction(async (tx) => {
		const before = await tx.remnant2Build.findUnique({
			where: { id: buildId },
			select: { ...BUILD_SUMMARY_SELECT, updatedAt: true },
		});
		if (!before) throw new Error("Build not found");

		await updateBuildAsModerator(
			tx,
			buildId,
			before.updatedAt,
			Object.fromEntries(changed),
		);

		await logModerationAction({
			tx,
			actorId,
			gameId: REMNANT2,
			action: "MODERATOR_EDIT",
			targetType: BUILD,
			targetId: buildId,
			previousValue: JSON.stringify(
				Object.fromEntries(
					changed.map(([key]) => [key, before[key as keyof typeof before]]),
				),
			),
			newValue: JSON.stringify(Object.fromEntries(changed)),
			reason,
		});

		await markBuildReviewed(tx, buildId);
	});

	return { ok: true as const };
};

const setBuildFeedMembership = async (args: {
	buildId: string;
	feed: Remnant2BuildFeed;
	member: boolean;
}) => {
	const actorId = await requireCapability("feed:manage", REMNANT2);
	await enforceUserWriteLimit(actorId);

	await prisma.$transaction(async (tx) => {
		if (args.member) {
			await tx.remnant2BuildFeedMembership.upsert({
				where: { feed_buildId: { feed: args.feed, buildId: args.buildId } },
				update: {},
				create: { feed: args.feed, buildId: args.buildId },
			});
		} else {
			await tx.remnant2BuildFeedMembership.deleteMany({
				where: { feed: args.feed, buildId: args.buildId },
			});
		}

		await logModerationAction({
			tx,
			actorId,
			gameId: REMNANT2,
			action: args.member ? "FEED_ADD" : "FEED_REMOVE",
			targetType: BUILD,
			targetId: args.buildId,
			newValue: args.feed,
		});
	});

	return { ok: true as const };
};

const hideAllPublicContentForUser: HideUserContent = async (
	tx,
	userId,
	actorId,
) => {
	const builds = await tx.remnant2Build.findMany({
		where: { createdById: userId, visibility: "PUBLIC" },
		select: { id: true },
	});
	const buildIds = builds.map((build) => build.id);

	// Raw so the rows keep their `updatedAt`: @updatedAt is stamped by the client,
	// and a ban is not the author editing their work. One statement per table
	// rather than per row, since updateMany cannot carry a per-row timestamp.
	await tx.$executeRaw`
		UPDATE "Remnant2Build" SET "moderatorStatus" = 'REJECTED'::"BuildModeratorStatus"
		WHERE "createdById" = ${userId} AND "visibility" = 'PUBLIC'::"BuildVisibility"`;
	await tx.$executeRaw`
		UPDATE "Remnant2BuildCollection" SET "moderatorStatus" = 'REJECTED'::"BuildModeratorStatus"
		WHERE "createdById" = ${userId} AND "visibility" = 'PUBLIC'::"BuildVisibility"`;

	// The content is actioned, so its queue cards are answered. Leaving them open
	// would show moderators work whose outcome a ban has already decided.
	await resolveOpenReviews(tx, BUILD, buildIds, actorId, "RESOLVED");
};

export {
	applyBuildAction,
	countOpenReviews,
	hideAllPublicContentForUser,
	listAuditLog,
	listReviewQueue,
	moderateBuildContent,
	moderatorUpdateBuild,
	setBuildFeedMembership,
};
