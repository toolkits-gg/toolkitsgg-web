import type {
	BuildFeedSort,
	CreatedBuildSummary,
} from "#/features/game/data/types";
import { HIDDEN_MODERATOR_STATUSES } from "#/features/moderation/build-status.server";
import { attachVariantSets } from "#/games/remnant2/data/build-collections/build-variant-sets.server";
import {
	BuildCollectionDisplayMode,
	BuildVisibility,
	prisma,
	type Remnant2BuildFeed,
} from "@/prisma";

const FEED_PAGE_SIZE = 60;

/**
 * Public listings hide what a moderator has actioned, rather than requiring
 * approval first: a new build is live the moment it is created and stays live
 * until someone acts on it.
 */
const PUBLIC_BUILD_WHERE = {
	visibility: BuildVisibility.PUBLIC,
	moderatorStatus: { notIn: HIDDEN_MODERATOR_STATUSES },
} as const;

/**
 * Hides non-primary members of PUBLIC variant sets so a set takes one feed slot
 * instead of one per variant. Applied as a where clause rather than a post-filter
 * so a page still comes back full.
 *
 * Only PUBLIC sets collapse: an UNLISTED or PRIVATE set must not silently pull a
 * public build out of the community feed.
 *
 * `matchedVariantIds` is the seam for filtering, which build feeds do not have
 * yet - every caller passes `[]` today. Once a filter can match a specific
 * variant, passing its id keeps that variant visible in place of its primary.
 */
const variantCollapseWhere = (matchedVariantIds: string[]) => ({
	NOT: {
		BuildCollections: {
			some: {
				position: { gt: 0 },
				Collection: {
					displayMode: BuildCollectionDisplayMode.VARIANTS,
					visibility: BuildVisibility.PUBLIC,
				},
				...(matchedVariantIds.length > 0
					? { buildId: { notIn: matchedVariantIds } }
					: {}),
			},
		},
	},
});

const listBuildsInFeed = async (
	feed: string,
	viewerId: string | null,
): Promise<CreatedBuildSummary[]> => {
	const rows = await prisma.remnant2BuildFeedMembership.findMany({
		where: {
			feed: feed as Remnant2BuildFeed,
			Build: { ...PUBLIC_BUILD_WHERE, ...variantCollapseWhere([]) },
		},
		orderBy: { addedAt: "desc" },
		take: FEED_PAGE_SIZE,
		include: { Build: true },
	});
	return attachVariantSets(
		rows.map((row) => row.Build),
		viewerId,
	);
};

const listCommunityBuilds = async (
	sort: BuildFeedSort,
	viewerId: string | null,
): Promise<CreatedBuildSummary[]> => {
	const rows = await prisma.remnant2Build.findMany({
		where: { ...PUBLIC_BUILD_WHERE, ...variantCollapseWhere([]) },
		// Ties are broken by id so the composite indexes on
		// [visibility, moderatorStatus, <sort>, id] are usable.
		orderBy:
			sort === "popular"
				? [{ upvoteCount: "desc" }, { id: "desc" }]
				: [{ createdAt: "desc" }, { id: "desc" }],
		take: FEED_PAGE_SIZE,
	});
	return attachVariantSets(rows, viewerId);
};

export { listBuildsInFeed, listCommunityBuilds };
