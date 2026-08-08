// Remnant 2 moderation: validators plus the TanStack server-fn wrappers. Like
// the other data modules, `@/prisma` is never referenced at module scope, so
// this file is safe to import from client components.
//
// There is deliberately no `.sync.server.ts` sibling and no entry in the sync
// handler registry: `apply-pending-ops` dispatches through that registry behind
// nothing more than `requireUserId()`, and privileged mutations must not be
// reachable from it.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type {
	ModerationAuditRow,
	ModerationReviewRow,
} from "#/features/game/data/types";
import { MAX_DESCRIPTION_LENGTH } from "#/features/markdown/constants";
import { BUILD_FEED_VALUES } from "#/games/remnant2/data/build-feeds/build-feeds";
import {
	applyBuildAction,
	countOpenReviews,
	listAuditLog,
	listReviewQueue,
	moderateBuildContent,
	moderatorUpdateBuild,
	setBuildFeedMembership,
} from "#/games/remnant2/data/moderation/moderation.server";

// Client-safe mirrors of the Prisma enums, same reason as BUILD_FEED_VALUES.
const REVIEW_STATUS_VALUES = ["OPEN", "RESOLVED", "DISMISSED"] as const;
const RESOLUTION_VALUES = [
	"APPROVE",
	"DISMISS",
	"SET_PRIVATE",
	"LOCK",
	"UNLOCK",
	"DELETE",
] as const;

const QueueInput = z.object({ status: z.enum(REVIEW_STATUS_VALUES) });
const AuditInput = z.object({ targetId: z.string().min(1).optional() });
const BuildActionInput = z.object({
	buildId: z.string().min(1),
	action: z.enum(RESOLUTION_VALUES),
	reason: z.string().max(2000).optional(),
});
const ContentInput = z.object({
	buildId: z.string().min(1),
	clearVideo: z.boolean().optional(),
	clearDescription: z.boolean().optional(),
	reason: z.string().max(2000).optional(),
});
const ModeratorEditInput = z.object({
	buildId: z.string().min(1),
	name: z.string().min(1).optional(),
	description: z.string().max(MAX_DESCRIPTION_LENGTH).nullable().optional(),
	videoUrl: z.string().nullable().optional(),
	referenceUrl: z.string().nullable().optional(),
	reason: z.string().max(2000).optional(),
});
const FeedMembershipInput = z.object({
	buildId: z.string().min(1),
	feed: z.enum(BUILD_FEED_VALUES),
	member: z.boolean(),
});

const listReviewQueueServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => QueueInput.parse(v))
	.handler(
		async ({ data }): Promise<ModerationReviewRow[]> =>
			listReviewQueue(data.status),
	);

const countOpenReviewsServerFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<number> => countOpenReviews(),
);

const listAuditLogServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => AuditInput.parse(v))
	.handler(
		async ({ data }): Promise<ModerationAuditRow[]> =>
			listAuditLog(data.targetId),
	);

const moderateBuildServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => BuildActionInput.parse(v))
	.handler(async ({ data }) =>
		applyBuildAction(data.buildId, data.action, data.reason),
	);

const moderateBuildContentServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => ContentInput.parse(v))
	.handler(async ({ data }) => moderateBuildContent(data));

const moderatorUpdateBuildServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => ModeratorEditInput.parse(v))
	.handler(async ({ data }) => moderatorUpdateBuild(data));

const setBuildFeedMembershipServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => FeedMembershipInput.parse(v))
	.handler(async ({ data }) => setBuildFeedMembership(data));

export {
	countOpenReviewsServerFn,
	listAuditLogServerFn,
	listReviewQueueServerFn,
	moderateBuildContentServerFn,
	moderateBuildServerFn,
	moderatorUpdateBuildServerFn,
	REVIEW_STATUS_VALUES,
	setBuildFeedMembershipServerFn,
};
