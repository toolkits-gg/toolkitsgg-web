import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { CreatedBuildSummary } from "#/features/game/data/types";
import { getOptionalUserId } from "#/features/user/require-user.server";
import {
	listBuildsInFeed,
	listCommunityBuilds,
} from "#/games/remnant2/data/build-feeds/build-feeds.server";

// Client-safe mirror of the Prisma `Remnant2BuildFeed` enum, so this validation
// module never references `@/prisma` at module scope.
const BUILD_FEED_VALUES = [
	"FEATURED",
	"BASE_GAME",
	"BEGINNER",
	"GIMMICK",
] as const;

const FeedInput = z.object({ feed: z.enum(BUILD_FEED_VALUES) });
const CommunityInput = z.object({ sort: z.enum(["recent", "popular"]) });

const listBuildsInFeedServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => FeedInput.parse(v))
	.handler(async ({ data }): Promise<CreatedBuildSummary[]> => {
		const viewerId = await getOptionalUserId();
		return listBuildsInFeed(data.feed, viewerId);
	});

const listCommunityBuildsServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => CommunityInput.parse(v))
	.handler(async ({ data }): Promise<CreatedBuildSummary[]> => {
		const viewerId = await getOptionalUserId();
		return listCommunityBuilds(data.sort, viewerId);
	});

export {
	BUILD_FEED_VALUES,
	listBuildsInFeedServerFn,
	listCommunityBuildsServerFn,
};
