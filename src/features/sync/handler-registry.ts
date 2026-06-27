// Explicit registry of offline-sync handlers, keyed by entity name.
//
// Each entity's handler is imported and listed here by hand — no auto-discovery.
// To add a new syncable entity: export its SyncHandler, then add one line below.
// applyPendingOpServerFn looks up the handler for an op's `entity` here.

import { favoriteGameSyncHandler } from "#/features/game/data/favorite-games/favorite-games.ts";
import {
	userAvatarOverrideHandler,
	userProfileHandler,
} from "#/features/game/data/user-profile/user-profile.ts";
import type { SyncHandler } from "#/features/sync/types.ts";
import { clairObscurCollectedItemHandler } from "#/games/clairobscur/data/server/collected-items.ts";
import { remnant2CollectedItemHandler } from "#/games/remnant2/data/server/collected-items.ts";
import { remnant2BuildHandler } from "#/games/remnant2/data/server/created-builds.ts";
import { slayTheSpire2CollectedItemHandler } from "#/games/slaythespire2/data/server/collected-items.ts";

/** entity name -> SyncHandler. The `entity` field on each PendingOp indexes this. */
const syncHandlers: Record<string, SyncHandler> = {
	remnant2CollectedItem: remnant2CollectedItemHandler,
	clairObscurCollectedItem: clairObscurCollectedItemHandler,
	slayTheSpire2CollectedItem: slayTheSpire2CollectedItemHandler,
	remnant2Build: remnant2BuildHandler,
	userFavoriteGame: favoriteGameSyncHandler,
	userProfile: userProfileHandler,
	userAvatarOverride: userAvatarOverrideHandler,
};

export { syncHandlers };
