import type { SyncHandler } from "#/features/dal/types.ts";
import { collectedItemSyncHandler as clairObscurCollectedItemSyncHandler } from "#/games/clairobscur/dal/server/sync-handler";
import { collectedItemSyncHandler as remnant2CollectedItemSyncHandler } from "#/games/remnant2/dal/server/sync-handler";
import { collectedItemSyncHandler as slayTheSpire2CollectedItemSyncHandler } from "#/games/slaythespire2/dal/server/sync-handler";

// When adding a new game, register its collectedItemSyncHandler here.
export const gameSyncHandlers: Record<string, SyncHandler> = {
	clairObscurCollectedItem: clairObscurCollectedItemSyncHandler,
	remnant2CollectedItem: remnant2CollectedItemSyncHandler,
	slayTheSpire2CollectedItem: slayTheSpire2CollectedItemSyncHandler,
};
