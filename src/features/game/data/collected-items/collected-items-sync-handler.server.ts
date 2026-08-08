/**
 * Shared sync handler for collected items.
 *
 * Split from the CRUD factory so the sync-replay path stays apart from direct
 * data access, matching the per-entity `.sync.server.ts` split. Collected items
 * are a presence toggle, so the conflict resolution comes from
 * `createPresenceToggleSyncHandler` and only the key extraction is local.
 */

import { asCollectedItemTable } from "#/features/game/data/collected-items/collected-item-table";
import { createPresenceToggleSyncHandler } from "#/features/sync/presence-sync-handler";
import type { SyncHandler } from "#/features/sync/types";

const createCollectedItemSyncHandler = (delegate: unknown): SyncHandler => {
	const table = asCollectedItemTable(delegate);

	return createPresenceToggleSyncHandler<string>({
		resolveKey: (op) => {
			const itemId = (op.payload as { itemId?: string } | null)?.itemId;
			return itemId
				? { ok: true, key: itemId }
				: { ok: false, message: "missing itemId" };
		},
		findRecord: (userId, itemId) =>
			table.findUnique({ where: { userId_itemId: { userId, itemId } } }),
		deleteRecord: async (userId, itemId) => {
			await table.deleteMany({ where: { userId, itemId } });
		},
		createRecord: async (userId, itemId) => {
			await table.create({ data: { userId, itemId } });
		},
	});
};

export { createCollectedItemSyncHandler };
