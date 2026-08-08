/**
 * The local stores for user-owned data: the profile and the per-game overrides
 * that hang off it.
 *
 * These are the four stores whose rows have no Prisma model type available on
 * the client, because their key paths include the `GameId` enum. `types.ts`
 * carries hand-written mirrors instead, matching the field set the server would
 * have written.
 */

import { createStore } from "#/features/local-db/idb-store";
import type { GameId } from "@/prisma";

/**
 * Overrides key on their own id rather than on `[userId, gameId]` so the row
 * survives being re-keyed to a different owner. Anything that moves an override
 * between users has to derive the new id with this.
 */
const overrideId = (userId: string, gameId: GameId) => `${userId}:${gameId}`;

const userProfileStore = createStore({
	name: "userProfile",
	keyPath: "userId",
	indexes: ["userId"],
	defaults: {
		displayName: "Traveler",
		bio: "No bio provided.",
		primaryAvatarId: null,
		primaryAvatarGameId: null,
		primaryHeaderImageId: null,
		primaryHeaderImageGameId: null,
		primaryHeaderImagePositionX: 0.5,
		primaryHeaderImagePositionY: 0.5,
	},
});

const userFavoriteGameStore = createStore({
	name: "userFavoriteGame",
	keyPath: ["userId", "gameId"],
	indexes: ["userId"],
});

const userAvatarOverrideStore = createStore({
	name: "userAvatarOverride",
	keyPath: "id",
	indexes: ["userId"],
});

const userHeaderImageOverrideStore = createStore({
	name: "userHeaderImageOverride",
	keyPath: "id",
	indexes: ["userId"],
	defaults: { headerImagePositionX: 0.5, headerImagePositionY: 0.5 },
});

export {
	overrideId,
	userAvatarOverrideStore,
	userFavoriteGameStore,
	userHeaderImageOverrideStore,
	userProfileStore,
};
