import type { BuildSnapshot } from "#/features/moderation/review-diff";

/**
 * Collapses the open review rows of one build into one piece of moderator work.
 *
 * `fileBuildReview` normally merges a re-edit into the build's existing open
 * row, but it is a read-then-write with no uniqueness behind it, so two
 * concurrent saves can each miss the other and file a second row. Grouping here
 * means one build is one card whether or not that race was won.
 */

type GroupableReviewItem = {
	id: string;
	targetId: string;
	createdAt: Date;
	updatedAt: Date;
	reason: string;
	changedFields: readonly string[];
	previous: BuildSnapshot | null;
	current: BuildSnapshot | null;
};

type ReviewGroup<T extends GroupableReviewItem> = T & {
	itemIds: string[];
	changedFields: string[];
};

/**
 * A build nobody has reviewed stays NEW_BUILD however many times its author
 * edits it, which is the same rule `fileBuildReview` follows when it leaves
 * `reason` alone on a merge.
 */
const REASON_PRECEDENCE = [
	"NEW_BUILD",
	"REPORTED",
	"PUBLISHED",
	"EDITED",
] as const;

const mergeReason = (existing: string, incoming: string): string => {
	for (const reason of REASON_PRECEDENCE) {
		if (existing === reason || incoming === reason) return reason;
	}
	return incoming;
};

/** Ties break on id so grouping is deterministic for rows filed in one tick. */
const isOlder = (a: GroupableReviewItem, b: GroupableReviewItem): boolean => {
	const delta = a.createdAt.getTime() - b.createdAt.getTime();
	return delta === 0 ? a.id < b.id : delta < 0;
};

const isNewer = (a: GroupableReviewItem, b: GroupableReviewItem): boolean => {
	const delta = a.updatedAt.getTime() - b.updatedAt.getTime();
	return delta === 0 ? a.id > b.id : delta > 0;
};

/**
 * Groups by target, preserving first-appearance order so the caller's ordering
 * survives. The merge compares timestamps rather than trusting input order: the
 * baseline comes from the oldest row so it stays pinned to the last reviewed
 * state, and the current state comes from the newest.
 *
 * `changedFields` follows the newest row rather than unioning the group. Every
 * row diffs the build against the same baseline - it only advances when a
 * moderator resolves, which closes all of them - so the newest row's diff is
 * already the complete one, and a union would re-flag fields an intervening edit
 * had put back.
 */
const groupOpenReviews = <T extends GroupableReviewItem>(
	items: readonly T[],
): ReviewGroup<T>[] => {
	const groups = new Map<string, ReviewGroup<T>>();

	for (const item of items) {
		const existing = groups.get(item.targetId);
		if (!existing) {
			groups.set(item.targetId, {
				...item,
				itemIds: [item.id],
				changedFields: [...item.changedFields],
			});
			continue;
		}

		const oldest = isOlder(item, existing) ? item : existing;
		const newest = isNewer(item, existing) ? item : existing;

		groups.set(item.targetId, {
			...newest,
			createdAt: oldest.createdAt,
			previous: oldest.previous,
			reason: mergeReason(existing.reason, item.reason),
			changedFields: [...newest.changedFields],
			itemIds: [...existing.itemIds, item.id],
		});
	}

	return [...groups.values()];
};

export type { GroupableReviewItem, ReviewGroup };
export { groupOpenReviews };
