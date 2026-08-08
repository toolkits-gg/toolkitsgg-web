import { createPresenceToggleSyncHandler } from "#/features/sync/presence-sync-handler";
import type { HasUpdatedAt, SyncHandler } from "#/features/sync/types";
import {
	removeUpvoteOwnedByUser,
	upvoteOwnedByUser,
} from "#/games/remnant2/data/build-upvotes/build-upvotes.server";
import { prisma } from "@/prisma";

const remnant2BuildUpvoteSyncHandler: SyncHandler =
	createPresenceToggleSyncHandler<string>({
		resolveKey: (op) => {
			const buildId = (op.payload as { buildId?: string } | null)?.buildId;
			return buildId
				? { ok: true, key: buildId }
				: { ok: false, message: "missing buildId" };
		},
		findRecord: (userId, buildId) =>
			prisma.remnant2BuildUpvote.findUnique({
				where: { buildId_userId: { buildId, userId } },
			}) as Promise<HasUpdatedAt | null>,
		createRecord: async (userId, buildId) => {
			await upvoteOwnedByUser(userId, buildId);
		},
		deleteRecord: async (userId, buildId) => {
			await removeUpvoteOwnedByUser(userId, buildId);
		},
	});

export { remnant2BuildUpvoteSyncHandler };
