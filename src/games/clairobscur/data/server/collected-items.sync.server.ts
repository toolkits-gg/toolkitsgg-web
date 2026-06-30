// Offline-sync handler for the clairObscurCollectedItem entity (presence toggle).
// Split out from collected-items.server.ts so the sync-replay path lives apart
// from the direct CRUD data access. The `.server.ts` suffix opts this into
// Start's import protection, keeping prisma out of the client bundle. Consumed
// only by the sync handler registry.

import { createPresenceToggleSyncHandler } from "#/features/sync/local-data/presence-sync-handler.ts";
import type { SyncHandler } from "#/features/sync/local-data/types.ts";
import { prisma } from "@/prisma";

const clairObscurCollectedItemHandler: SyncHandler =
	createPresenceToggleSyncHandler<string>({
		resolveKey: (op) => {
			const itemId = (op.payload as { itemId?: string } | null)?.itemId;
			return itemId
				? { ok: true, key: itemId }
				: { ok: false, message: "missing itemId" };
		},
		findRecord: (userId, itemId) =>
			prisma.clairObscurCollectedItem.findUnique({
				where: { userId_itemId: { userId, itemId } },
			}),
		deleteRecord: async (userId, itemId) => {
			await prisma.clairObscurCollectedItem.deleteMany({
				where: { userId, itemId },
			});
		},
		createRecord: async (userId, itemId) => {
			await prisma.clairObscurCollectedItem.create({
				data: { userId, itemId },
			});
		},
	});

export { clairObscurCollectedItemHandler };
