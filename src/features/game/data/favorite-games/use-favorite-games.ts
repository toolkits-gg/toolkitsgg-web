import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	favoriteGameServerFn,
	listFavoriteGamesServerFn,
	unfavoriteGameServerFn,
} from "#/features/game/data/favorite-games/favorite-games";
import type { LocalUserFavoriteGame } from "#/features/local-db/types";
import { userFavoriteGameStore } from "#/features/local-db/user-stores";
import { getOrCreateAnonUserId } from "#/features/sync/identity/anon-id";
import { enqueueOp } from "#/features/sync/queue/pending-ops";
import { getGameMetadata } from "#/games-registry/public-registry";
import { useSession } from "#/integrations/better-auth/auth-client";
import type { GameId } from "@/prisma";

const ENTITY = "userFavoriteGame";

type FavoriteGameInput = { gameId: GameId };
export const useFavoriteGames = () => {
	const { data: session } = useSession();
	const authUserId = session?.user?.id ?? null;
	const userId = authUserId ?? getOrCreateAnonUserId();
	const remote = !!authUserId;

	return useQuery({
		queryKey: ["data", ENTITY, "list", userId],
		queryFn: async (): Promise<LocalUserFavoriteGame[]> => {
			if (remote) return listFavoriteGamesServerFn();
			if (!userId) return [];
			return userFavoriteGameStore.findMany({ where: { userId } });
		},
	});
};

export const useFavoriteGame = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();

	return useMutation<LocalUserFavoriteGame, Error, FavoriteGameInput>({
		mutationFn: async (input) => {
			const authUserId = session?.user?.id ?? null;
			const anonUserId = getOrCreateAnonUserId();
			if (authUserId) return favoriteGameServerFn({ data: input });
			const [local] = await Promise.all([
				userFavoriteGameStore.upsert({
					where: { userId: anonUserId, gameId: input.gameId },
					update: {},
					create: { userId: anonUserId, gameId: input.gameId },
				}),
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

	return useMutation<{ ok: true }, Error, FavoriteGameInput>({
		mutationFn: async (input) => {
			const authUserId = session?.user?.id ?? null;
			const anonUserId = getOrCreateAnonUserId();
			if (authUserId) {
				return unfavoriteGameServerFn({ data: input });
			}
			await Promise.all([
				userFavoriteGameStore.deleteMany({
					where: { userId: anonUserId, gameId: input.gameId },
				}),
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
