// Remnant 2 build feeds: a read-only client hook. Feeds are server-curated
// listings of other users' public builds, so unlike the other build entities
// there is no local mirror and no local branch.

import { useQuery } from "@tanstack/react-query";
import type {
	BuildFeedSort,
	CreatedBuildSummary,
	GameBuildFeedsData,
} from "#/features/game/data/types";
import { COMMUNITY_FEED } from "#/features/game/data/utils";
import {
	BUILD_FEED_VALUES,
	listBuildsInFeedServerFn,
	listCommunityBuildsServerFn,
} from "#/games/remnant2/data/build-feeds/build-feeds";

const ENTITY = "remnant2BuildFeed";

type FeedName = (typeof BUILD_FEED_VALUES)[number];

const isFeedName = (feed: string): feed is FeedName =>
	(BUILD_FEED_VALUES as readonly string[]).includes(feed);

type FeedRequest = {
	key: string[];
	fetch: () => Promise<CreatedBuildSummary[]>;
};

/** Resolves a feed name to the listing it stands for, or null if it names nothing. */
const feedRequest = (feed: string, sort: BuildFeedSort): FeedRequest | null => {
	if (feed === COMMUNITY_FEED)
		return {
			key: ["community", sort],
			fetch: () => listCommunityBuildsServerFn({ data: { sort } }),
		};
	if (isFeedName(feed))
		return {
			key: ["feed", feed],
			fetch: () => listBuildsInFeedServerFn({ data: { feed } }),
		};
	return null;
};

const useFeed = (feed: string, sort: BuildFeedSort) => {
	const request = feedRequest(feed, sort);
	return useQuery({
		queryKey: ["data", ENTITY, ...(request?.key ?? ["unrecognized", feed])],
		queryFn: (): Promise<CreatedBuildSummary[]> =>
			request ? request.fetch() : Promise.resolve([]),
		enabled: !!request,
	});
};

const remnant2BuildFeedsData: GameBuildFeedsData = {
	useFeed,
};

export { remnant2BuildFeedsData };
