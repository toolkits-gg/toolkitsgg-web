// Offline-sync handler for the userFavoriteGame entity (a presence toggle).
// Split out from favorite-games.server.ts so the sync-replay path lives apart
// from the direct CRUD data access. The `.server.ts` suffix opts this into
// Start's import protection, keeping prisma out of the client bundle. Consumed
// only by the sync handler game-registry.

import { createPresenceToggleSyncHandler } from "#/features/sync/local-data/presence-sync-handler.ts";
import type { SyncHandler } from "#/features/sync/local-data/types.ts";
import { REGISTERED_GAME_IDS } from "#/registry/game-public-registry.tsx";
import { type GameId, prisma } from "@/prisma";

// Self-contained guard (intentionally duplicated from favorite-games.ts) so this
// server-only module never imports back from its client-safe sibling.
const GAME_ID_SET = new Set<string>(REGISTERED_GAME_IDS);
const isGameId = (value: string): value is GameId => GAME_ID_SET.has(value);

export const favoriteGameSyncHandler: SyncHandler =
	createPresenceToggleSyncHandler<GameId>({
		resolveKey: (op) => {
			const rawGameId = (op.payload as { gameId?: string } | null)?.gameId;
			if (!rawGameId) return { ok: false, message: "missing gameId" };
			if (!isGameId(rawGameId))
				return { ok: false, message: `unknown gameId ${rawGameId}` };
			return { ok: true, key: rawGameId };
		},
		findRecord: (userId, gameId) =>
			prisma.userFavoriteGame.findUnique({
				where: { userId_gameId: { userId, gameId } },
			}),
		deleteRecord: async (userId, gameId) => {
			await prisma.userFavoriteGame.deleteMany({ where: { userId, gameId } });
		},
		createRecord: async (userId, gameId) => {
			await prisma.userFavoriteGame.create({ data: { userId, gameId } });
		},
	});
