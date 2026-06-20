// SyncHandler for collected items — a presence-toggle entity (collected or not).
// Delegates the delete/upsert + LWW branching to createPresenceToggleSyncHandler.

import { createPresenceToggleSyncHandler } from "#/features/dal/presence-sync-handler.ts";
import type { HasUpdatedAt } from "#/features/dal/queue/last-write-wins.ts";
import type { SyncHandler } from "#/features/dal/types.ts";

// Structural interface so the same handler works with any game's Prisma model delegate
// without importing game-specific generated types. Each game passes its own model instance.
interface CollectedItemDelegate {
	findUnique(args: {
		where: { userId_itemId: { userId: string; itemId: string } };
	}): Promise<HasUpdatedAt | null>;
	deleteMany(args: {
		where: { userId: string; itemId: string };
	}): Promise<unknown>;
	create(args: { data: { userId: string; itemId: string } }): Promise<unknown>;
}

/** Creates a SyncHandler for a game's collected-item Prisma model. */
const createCollectedItemSyncHandler = (
	model: CollectedItemDelegate,
): SyncHandler =>
	createPresenceToggleSyncHandler<string>({
		resolveKey: (op) => {
			const payload = op.payload as { itemId?: string } | null;
			const itemId = payload?.itemId;
			return itemId
				? { ok: true, key: itemId }
				: { ok: false, message: "missing itemId" };
		},
		findRecord: (userId, itemId) =>
			model.findUnique({ where: { userId_itemId: { userId, itemId } } }),
		deleteRecord: async (userId, itemId) => {
			await model.deleteMany({ where: { userId, itemId } });
		},
		createRecord: async (userId, itemId) => {
			await model.create({ data: { userId, itemId } });
		},
	});

export { createCollectedItemSyncHandler };
