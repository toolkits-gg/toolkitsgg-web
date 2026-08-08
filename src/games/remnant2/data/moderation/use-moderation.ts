import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	GameBuildModerationData,
	ModerationAuditRow,
	ModerationResolution,
	ModerationReviewRow,
} from "#/features/game/data/types";
import { BUILD_FEED_VALUES } from "#/games/remnant2/data/build-feeds/build-feeds";
import {
	countOpenReviewsServerFn,
	listAuditLogServerFn,
	listReviewQueueServerFn,
	moderateBuildContentServerFn,
	moderateBuildServerFn,
	moderatorUpdateBuildServerFn,
	REVIEW_STATUS_VALUES,
	setBuildFeedMembershipServerFn,
} from "#/games/remnant2/data/moderation/moderation";

const ENTITY = "remnant2Moderation";

type ReviewStatus = (typeof REVIEW_STATUS_VALUES)[number];

const isReviewStatus = (status: string): status is ReviewStatus =>
	(REVIEW_STATUS_VALUES as readonly string[]).includes(status);

type FeedName = (typeof BUILD_FEED_VALUES)[number];

const isFeedName = (feed: string): feed is FeedName =>
	(BUILD_FEED_VALUES as readonly string[]).includes(feed);

/**
 * A moderator action can change what shows in the feeds, on a profile, and in
 * the queue at once, so the whole data cache is invalidated rather than an
 * enumerated subset that would drift as callers are added.
 */
const useInvalidateOnAction = () => {
	const queryClient = useQueryClient();
	return () => {
		void queryClient.invalidateQueries({ queryKey: ["data"] });
	};
};

const useReviewQueue = ({ status }: { status: string }) =>
	useQuery({
		queryKey: ["data", ENTITY, "queue", status],
		queryFn: (): Promise<ModerationReviewRow[]> =>
			isReviewStatus(status)
				? listReviewQueueServerFn({ data: { status } })
				: Promise.resolve([]),
		enabled: isReviewStatus(status),
	});

const useOpenReviewCount = () =>
	useQuery({
		queryKey: ["data", ENTITY, "openCount"],
		queryFn: (): Promise<number> => countOpenReviewsServerFn(),
	});

const useAuditLog = ({ targetId }: { targetId?: string }) =>
	useQuery({
		queryKey: ["data", ENTITY, "audit", targetId ?? "all"],
		queryFn: (): Promise<ModerationAuditRow[]> =>
			listAuditLogServerFn({ data: { targetId } }),
	});

const useBuildAction = () => {
	const invalidate = useInvalidateOnAction();
	return useMutation({
		mutationFn: (vars: {
			buildId: string;
			action: ModerationResolution;
			reason?: string;
		}) => moderateBuildServerFn({ data: vars }),
		onSuccess: invalidate,
	});
};

const useModerateContent = () => {
	const invalidate = useInvalidateOnAction();
	return useMutation({
		mutationFn: (vars: {
			buildId: string;
			clearVideo?: boolean;
			clearDescription?: boolean;
			reason?: string;
		}) => moderateBuildContentServerFn({ data: vars }),
		onSuccess: invalidate,
	});
};

const useModeratorUpdate = () => {
	const invalidate = useInvalidateOnAction();
	return useMutation({
		mutationFn: (vars: {
			buildId: string;
			name?: string;
			description?: string | null;
			videoUrl?: string | null;
			referenceUrl?: string | null;
			reason?: string;
		}) => moderatorUpdateBuildServerFn({ data: vars }),
		onSuccess: invalidate,
	});
};

const useSetFeedMembership = () => {
	const invalidate = useInvalidateOnAction();
	return useMutation({
		mutationFn: (vars: { buildId: string; feed: string; member: boolean }) => {
			if (!isFeedName(vars.feed)) {
				throw new Error(`Unknown feed: ${vars.feed}`);
			}
			return setBuildFeedMembershipServerFn({
				data: { ...vars, feed: vars.feed },
			});
		},
		onSuccess: invalidate,
	});
};

const remnant2ModerationData: GameBuildModerationData = {
	useReviewQueue,
	useOpenReviewCount,
	useAuditLog,
	useModerateContent,
	useModeratorUpdate,
	useSetFeedMembership,
	useBuildAction,
};

export { remnant2ModerationData };
