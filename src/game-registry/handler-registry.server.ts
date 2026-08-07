// Explicit game-registry of offline-sync handlers, keyed by entity name.
//
// Each entity's handler is imported and listed here by hand — no auto-discovery.
// To add a new syncable entity: export its SyncHandler, then add one line below.
// applyPendingOpServerFn looks up the handler for an op's `entity` here.
//
// Handlers live in per-entity `.server.ts` modules, so this game-registry is itself
// server-only (the `.server.ts` suffix opts it into Start's import protection).

import { favoriteGameSyncHandler } from "#/features/game/data/favorite-games/favorite-games.sync.server.ts";
import {
	userAvatarOverrideSyncHandler,
	userProfileSyncHandler,
} from "#/features/game/data/user-profile/user-profile.sync.server.ts";
import type { SyncHandler } from "#/features/sync/local-data/types.ts";
import { clairObscurCollectedItemHandler } from "#/games/clairobscur/data/server/collected-items.sync.server.ts";
import { remnant2CollectedItemSyncHandler } from "#/games/remnant2/data/collected-items/collected-items.sync.server.ts";
import { remnant2BuildSyncHandler } from "#/games/remnant2/data/created-builds/created-builds.sync.server.ts";
import { slayTheSpire2CollectedItemHandler } from "#/games/slaythespire2/data/server/collected-items.sync.server.ts";

/** entity name -> SyncHandler. The `entity` field on each PendingOp indexes this. */
const syncHandlers: Record<string, SyncHandler> = {
	remnant2CollectedItem: remnant2CollectedItemSyncHandler,
	clairObscurCollectedItem: clairObscurCollectedItemHandler,
	slayTheSpire2CollectedItem: slayTheSpire2CollectedItemHandler,
	remnant2Build: remnant2BuildSyncHandler,
	userFavoriteGame: favoriteGameSyncHandler,
	userProfile: userProfileSyncHandler,
	userAvatarOverride: userAvatarOverrideSyncHandler,
};

export { syncHandlers };
