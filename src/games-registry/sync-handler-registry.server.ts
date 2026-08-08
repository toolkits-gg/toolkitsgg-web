/**
 * Explicit games-registry of sync handlers, keyed by entity name.
 *
 * Each entity's handler is imported and listed here by hand.
 * To add a new syncable entity: export its SyncHandler, then add one line below.
 * applyPendingOpServerFn looks up the handler for an op's `entity` here.
 *
 * Handlers live in per-entity `.server.ts` modules, so this games-registry is itself
 * server-only.
 */

import { favoriteGameSyncHandler } from "#/features/game/data/favorite-games/favorite-games.sync.server";
import {
	userAvatarOverrideSyncHandler,
	userHeaderImageOverrideSyncHandler,
	userPrimaryAvatarSyncHandler,
	userPrimaryHeaderImageSyncHandler,
	userProfileSyncHandler,
} from "#/features/game/data/user-profile/user-profile.sync.server";
import type { SyncableEntity } from "#/features/sync/entities";
import type { SyncHandler } from "#/features/sync/types";
import { clairObscurCollectedItemSyncHandler } from "#/games/clairobscur/data/collected-items/collected-items.sync.server";
import {
	remnant2BuildCollectionSyncHandler,
	remnant2BuildOnCollectionSyncHandler,
} from "#/games/remnant2/data/build-collections/build-collections.sync.server";
import { remnant2BuildUpvoteSyncHandler } from "#/games/remnant2/data/build-upvotes/build-upvotes.sync.server";
import { remnant2CollectedItemSyncHandler } from "#/games/remnant2/data/collected-items/collected-items.sync.server";
import {
	remnant2BuildDuplicateSyncHandler,
	remnant2BuildSyncHandler,
} from "#/games/remnant2/data/created-builds/created-builds.sync.server";
import { slayTheSpire2CollectedItemSyncHandler } from "#/games/slaythespire2/data/collected-items/collected-items.sync.server";

/**
 * entity name -> SyncHandler. The `entity` field on each PendingOp indexes this.
 * Keyed on SyncableEntity rather than string, so an entity a hook can enqueue but
 * this games-registry has no handler for fails to compile.
 */
const syncHandlers: Record<SyncableEntity, SyncHandler> = {
	remnant2CollectedItem: remnant2CollectedItemSyncHandler,
	clairObscurCollectedItem: clairObscurCollectedItemSyncHandler,
	slayTheSpire2CollectedItem: slayTheSpire2CollectedItemSyncHandler,
	remnant2Build: remnant2BuildSyncHandler,
	remnant2BuildDuplicate: remnant2BuildDuplicateSyncHandler,
	remnant2BuildCollection: remnant2BuildCollectionSyncHandler,
	remnant2BuildOnCollection: remnant2BuildOnCollectionSyncHandler,
	remnant2BuildUpvote: remnant2BuildUpvoteSyncHandler,
	userFavoriteGame: favoriteGameSyncHandler,
	userProfile: userProfileSyncHandler,
	userPrimaryAvatar: userPrimaryAvatarSyncHandler,
	userAvatarOverride: userAvatarOverrideSyncHandler,
	userPrimaryHeaderImage: userPrimaryHeaderImageSyncHandler,
	userHeaderImageOverride: userHeaderImageOverrideSyncHandler,
};

export { syncHandlers };
