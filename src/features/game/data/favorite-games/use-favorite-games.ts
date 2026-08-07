import { useNetwork } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	deleteLocalFavoriteGame,
	listLocalFavoriteGames,
	upsertLocalFavoriteGame,
} from "#/features/game/data/favorite-games/favorite-games.idb.ts";
import {
	favoriteGameServerFn,
	listFavoriteGamesServerFn,
	unfavoriteGameServerFn,
} from "#/features/game/data/favorite-games/favorite-games.ts";
import { getOrCreateAnonUserId } from "#/features/sync/local-data/identity/anon-id.ts";
import type { LocalUserFavoriteGame } from "#/features/sync/local-data/local/types.ts";
import { enqueueOp } from "#/features/sync/local-data/queue/pending-ops.ts";
import { useSession } from "#/integrations/better-auth/auth-client.ts";
import { getGameMetadata } from "#/game-registry/public-registry.ts";
import type { GameId } from "@/prisma";

const ENTITY = "userFavoriteGame";

export type FavoriteGameInput = { gameId: GameId };
export const useFavoriteGames = () => {
	const { data: session } = useSession();
	const { online } = useNetwork();
	const authUserId = session?.user?.id ?? null;
	const userId = authUserId ?? getOrCreateAnonUserId();
	const remote = !!authUserId && online;

	return useQuery({
		queryKey: ["data", ENTITY, "list", userId],
		queryFn: async (): Promise<LocalUserFavoriteGame[]> => {
			if (remote) {
				const rows = await listFavoriteGamesServerFn();
				return rows.map((r) => ({
					userId: r.userId,
					gameId: r.gameId,
					createdAt: r.createdAt.toISOString(),
					updatedAt: r.updatedAt.toISOString(),
				}));
			}
			if (!userId) return [];
			return listLocalFavoriteGames(userId);
		},
	});
};

export const useFavoriteGame = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();
	const { online } = useNetwork();

	return useMutation<LocalUserFavoriteGame, Error, FavoriteGameInput>({
		mutationFn: async (input) => {
			const authUserId = session?.user?.id ?? null;
			const anonUserId = getOrCreateAnonUserId();
			const userId = authUserId ?? anonUserId;
			if (authUserId && online) {
				const row = await favoriteGameServerFn({ data: input });
				return {
					userId: row.userId,
					gameId: row.gameId,
					createdAt: row.createdAt.toISOString(),
					updatedAt: row.updatedAt.toISOString(),
				};
			}
			const [local] = await Promise.all([
				upsertLocalFavoriteGame({ userId, gameId: input.gameId }),
				enqueueOp({
					anonUserId,
					entity: ENTITY,
					operation: "upsert",
					payload: input,
					idempotencyKey: `${ENTITY}:upsert:${anonUserId}:${input.gameId}`,
					summary: {
						title: "Favorited game",
						details: getGameMetadata(input.gameId)?.label,
						gameId: input.gameId,
					},
				}),
			]);
			return local;
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["data", ENTITY] }),
	});
};

export const useUnfavoriteGame = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();
	const { online } = useNetwork();

	return useMutation<{ ok: true }, Error, FavoriteGameInput>({
		mutationFn: async (input) => {
			const authUserId = session?.user?.id ?? null;
			const anonUserId = getOrCreateAnonUserId();
			const userId = authUserId ?? anonUserId;
			if (authUserId && online) {
				return unfavoriteGameServerFn({ data: input });
			}
			await Promise.all([
				deleteLocalFavoriteGame({ userId, gameId: input.gameId }),
				enqueueOp({
					anonUserId,
					entity: ENTITY,
					operation: "delete",
					payload: input,
					idempotencyKey: `${ENTITY}:delete:${anonUserId}:${input.gameId}`,
					summary: {
						title: "Unfavorited game",
						details: getGameMetadata(input.gameId)?.label,
						gameId: input.gameId,
					},
				}),
			]);
			return { ok: true as const };
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["data", ENTITY] }),
	});
};
