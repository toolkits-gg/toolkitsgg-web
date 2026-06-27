// Favorite games: client data hooks. Each hook inlines the backend choice
// (remote when authed + online, else local IndexedDB + a queued op for sync).

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
import { getGameMetadata } from "#/features/game/registry/game-public-registry.tsx";
import { getOrCreateAnonUserId } from "#/features/sync/identity/anon-id.ts";
import type { LocalUserFavoriteGame } from "#/features/sync/local/types.ts";
import { enqueueOp } from "#/features/sync/queue/pending-ops.ts";
import { useSession } from "#/integrations/better-auth/auth-client.ts";
import type { GameId } from "@/prisma";

type FavoriteGameInput = { gameId: GameId };

const ENTITY = "userFavoriteGame";

const useFavoriteGames = () => {
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

const useFavoriteGame = () => {
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

const useUnfavoriteGame = () => {
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

export type { FavoriteGameInput };
export { useFavoriteGame, useFavoriteGames, useUnfavoriteGame };
