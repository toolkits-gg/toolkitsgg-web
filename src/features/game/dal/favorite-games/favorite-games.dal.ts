import { defineDalRead, defineDalWrite } from "#/features/dal/define-action.ts";
import type { LocalUserFavoriteGame } from "#/features/dal/local/types.ts";
import type { DalContext } from "#/features/dal/types.ts";
import {
	deleteLocalFavoriteGame,
	listLocalFavoriteGames,
	upsertLocalFavoriteGame,
} from "#/features/game/dal/favorite-games/favorite-games.idb.ts";
import {
	favoriteGameServerFn,
	listFavoriteGamesServerFn,
	unfavoriteGameServerFn,
} from "#/features/game/dal/favorite-games/favorite-games.ts";
import { getGameMetadata } from "#/features/game/registry/game-registry.tsx";
import type { GameId } from "@/prisma";

interface FavoriteGameInput {
	gameId: GameId;
}

const resolveLocalUserId = (ctx: DalContext): string => {
	return ctx.authUserId ?? ctx.anonUserId;
};

const createFavoriteGameDal = () => {
	return {
		list: defineDalRead<void, LocalUserFavoriteGame[]>({
			queryKey: () => ["userFavoriteGame", "list"] as const,
			remote: async () => {
				const rows = await listFavoriteGamesServerFn();
				return rows.map((r) => ({
					userId: r.userId,
					gameId: r.gameId,
					createdAt: r.createdAt.toISOString(),
					updatedAt: r.updatedAt.toISOString(),
				}));
			},
			local: async (_input, ctx) => {
				const userId = resolveLocalUserId(ctx);
				if (!userId) return [];
				return listLocalFavoriteGames(userId);
			},
		}),

		favorite: defineDalWrite<FavoriteGameInput, LocalUserFavoriteGame>({
			entity: "userFavoriteGame",
			operation: "upsert",
			invalidates: ["userFavoriteGame"],
			buildIdempotencyKey: (input, ctx) =>
				`userFavoriteGame:upsert:${ctx.anonUserId}:${input.gameId}`,
			describe: (input) => ({
				title: "Favorited game",
				details: getGameMetadata(input.gameId)?.label,
				gameId: input.gameId,
			}),
			remote: async (input) => {
				const row = await favoriteGameServerFn({ data: input });
				return {
					userId: row.userId,
					gameId: row.gameId,
					createdAt: row.createdAt.toISOString(),
					updatedAt: row.updatedAt.toISOString(),
				};
			},
			local: async (input, ctx) => {
				const userId = resolveLocalUserId(ctx);
				return upsertLocalFavoriteGame({ userId, gameId: input.gameId });
			},
		}),

		unfavorite: defineDalWrite<FavoriteGameInput, { ok: true }>({
			entity: "userFavoriteGame",
			operation: "delete",
			invalidates: ["userFavoriteGame"],
			buildIdempotencyKey: (input, ctx) =>
				`userFavoriteGame:delete:${ctx.anonUserId}:${input.gameId}`,
			describe: (input) => ({
				title: "Unfavorited game",
				details: getGameMetadata(input.gameId)?.label,
				gameId: input.gameId,
			}),
			remote: async (input) => unfavoriteGameServerFn({ data: input }),
			local: async (input, ctx) => {
				const userId = resolveLocalUserId(ctx);
				await deleteLocalFavoriteGame({ userId, gameId: input.gameId });
				return { ok: true as const };
			},
		}),
	};
};

export { createFavoriteGameDal };
