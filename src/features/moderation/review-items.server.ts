import type { BuildSnapshot } from "#/features/moderation/review-diff";
import { diffModeratableFields } from "#/features/moderation/review-diff";
import type {
	GameId,
	ModerationReviewReason,
	ModerationTargetType,
	prisma,
} from "@/prisma";

type PrismaTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/** The build columns a snapshot is made of, as a Prisma select. */
const SNAPSHOT_SELECT = {
	name: true,
	description: true,
	videoUrl: true,
	referenceUrl: true,
	visibility: true,
} as const;

const toSnapshot = (build: {
	name: string;
	description: string | null;
	videoUrl: string | null;
	referenceUrl: string | null;
	visibility: string;
}): BuildSnapshot => ({
	name: build.name,
	description: build.description,
	videoUrl: build.videoUrl,
	referenceUrl: build.referenceUrl,
	visibility: build.visibility,
});

/** Snapshots round-trip through Json columns, which type as `JsonValue`. */
const fromJsonSnapshot = (value: unknown): BuildSnapshot | null =>
	value === null || value === undefined ? null : (value as BuildSnapshot);

type FileBuildReviewArgs = {
	tx: PrismaTx;
	gameId: GameId;
	buildId: string;
	authorId: string;
	reason: ModerationReviewReason;
	/** The state a moderator last saw. Null when nobody has reviewed this build. */
	previous: BuildSnapshot | null;
	next: BuildSnapshot;
};

const BUILD: ModerationTargetType = "BUILD";

/**
 * Enqueues moderator work for a build that has already been written. Content is
 * never gated on this: the build is live either way.
 *
 * A second edit before anyone reviews rewrites the open row instead of stacking
 * another one. Both the row and this call diff against the same baseline - it
 * only advances when a moderator resolves, which closes the row - so the newer
 * diff supersedes the older one outright rather than unioning with it. That is
 * what lets an edit-and-revert shrink the row back down instead of leaving a
 * field flagged that no longer differs.
 *
 * Prisma cannot express the partial unique index that would let this be an
 * upsert, so it is a read-then-write inside the caller's transaction.
 */
const fileBuildReview = async ({
	tx,
	gameId,
	buildId,
	authorId,
	reason,
	previous,
	next,
}: FileBuildReviewArgs): Promise<void> => {
	const changedFields = diffModeratableFields(previous, next);
	if (changedFields.length === 0) {
		await withdrawOpenReviews(tx, BUILD, buildId);
		return;
	}

	const open = await tx.moderationReviewItem.findFirst({
		where: { targetType: BUILD, targetId: buildId, status: "OPEN" },
		select: { id: true },
	});

	if (open) {
		await tx.moderationReviewItem.update({
			where: { id: open.id },
			// `reason` is left alone: a build that was never reviewed stays
			// NEW_BUILD however many times its author edits it.
			data: { changedFields, currentSnapshot: next },
		});
		return;
	}

	await tx.moderationReviewItem.create({
		data: {
			gameId,
			targetType: BUILD,
			targetId: buildId,
			authorId,
			reason,
			changedFields,
			...(previous === null ? {} : { previousSnapshot: previous }),
			currentSnapshot: next,
		},
	});
};

/**
 * Drops the open reviews for a target without recording a decision, for content
 * that has stopped being publicly consumable or has returned to the state a
 * moderator already approved.
 *
 * Deleting rather than resolving is what keeps the withdrawal from reading as a
 * pardon: the build's `lastReviewedSnapshot` is untouched, so republishing files
 * a fresh item diffed against that same baseline and every unreviewed change
 * comes back with it.
 */
const withdrawOpenReviews = async (
	tx: PrismaTx,
	targetType: ModerationTargetType,
	targetId: string,
): Promise<void> => {
	await tx.moderationReviewItem.deleteMany({
		where: { targetType, targetId, status: "OPEN" },
	});
};

/** Closes any open review for the targets, used when a moderator actions them. */
const resolveOpenReviews = async (
	tx: PrismaTx,
	targetType: ModerationTargetType,
	targetIds: string[],
	resolvedById: string,
	status: "RESOLVED" | "DISMISSED",
): Promise<void> => {
	if (targetIds.length === 0) return;
	await tx.moderationReviewItem.updateMany({
		where: { targetType, targetId: { in: targetIds }, status: "OPEN" },
		data: { status, resolvedAt: new Date(), resolvedById },
	});
};

export type { PrismaTx };
export {
	fileBuildReview,
	fromJsonSnapshot,
	resolveOpenReviews,
	SNAPSHOT_SELECT,
	toSnapshot,
	withdrawOpenReviews,
};
