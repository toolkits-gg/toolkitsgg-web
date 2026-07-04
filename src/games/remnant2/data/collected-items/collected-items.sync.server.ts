// Offline-sync handler for the remnant2CollectedItem entity (presence toggle).
// Split out from collected-items.created-builds.ts so the sync-replay path lives apart
// from the direct CRUD data access. The `.created-builds.ts` suffix opts this into
// Start's import protection, keeping prisma out of the client bundle. Consumed
// only by the sync handler game-registry.

import { createPresenceToggleSyncHandler } from "#/features/sync/local-data/presence-sync-handler.ts";
import type { SyncHandler } from "#/features/sync/local-data/types.ts";
import { prisma } from "@/prisma";

export const remnant2CollectedItemSyncHandler: SyncHandler =
	createPresenceToggleSyncHandler<string>({
		resolveKey: (op) => {
			const itemId = (op.payload as { itemId?: string } | null)?.itemId;
			return itemId
				? { ok: true, key: itemId }
				: { ok: false, message: "missing itemId" };
		},
		findRecord: (userId, itemId) =>
			prisma.remnant2CollectedItem.findUnique({
				where: { userId_itemId: { userId, itemId } },
			}),
		deleteRecord: async (userId, itemId) => {
			await prisma.remnant2CollectedItem.deleteMany({
				where: { userId, itemId },
			});
		},
		createRecord: async (userId, itemId) => {
			await prisma.remnant2CollectedItem.create({ data: { userId, itemId } });
		},
	});
