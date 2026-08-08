import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { CreatedBuildSummary } from "#/features/game/data/types";
import { getOptionalUserId } from "#/features/user/require-user.server";
import {
	hasUpvotedBuild,
	listUpvotedBuilds,
	removeBuildUpvote,
	upvoteBuild,
} from "#/games/remnant2/data/build-upvotes/build-upvotes.server";

const BuildByIdInput = z.object({ buildId: z.string().min(1) });
const ListByUserIdInput = z.object({ userId: z.string().min(1) });

const upvoteBuildServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => BuildByIdInput.parse(v))
	.handler(async ({ data }) => upvoteBuild(data.buildId));

const removeBuildUpvoteServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => BuildByIdInput.parse(v))
	.handler(async ({ data }) => removeBuildUpvote(data.buildId));

const listUpvotedBuildsServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => ListByUserIdInput.parse(v))
	.handler(async ({ data }): Promise<CreatedBuildSummary[]> => {
		const viewerId = await getOptionalUserId();
		return listUpvotedBuilds(data.userId, viewerId);
	});

const hasUpvotedBuildServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => BuildByIdInput.parse(v))
	.handler(async ({ data }): Promise<boolean> => hasUpvotedBuild(data.buildId));

export {
	hasUpvotedBuildServerFn,
	listUpvotedBuildsServerFn,
	removeBuildUpvoteServerFn,
	upvoteBuildServerFn,
};
