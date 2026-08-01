import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { SERVER_RESOLVED_GAME_ID_SOURCES } from "#/constants";
import type { ServerResolvedGameIdSources } from "#/features/game/active-game.ts";
import { setGame } from "#/features/game/store.ts";
import { setActiveGameCookie } from "#/features/game/utils.ts";
import type { GameId } from "@/prisma";

const useSetActiveGame = (): ((gameId: GameId | null) => void) => {
	const queryClient = useQueryClient();

	return useCallback(
		(gameId: GameId | null) => {
			setActiveGameCookie(gameId);
			setGame(gameId);
			queryClient.setQueryData(
				SERVER_RESOLVED_GAME_ID_SOURCES,
				// Nothing cached yet means the subdomain half is unknown, and guessing it
				// would be wrong on a game subdomain. Leave it absent so the next read fetches.
				(prev: ServerResolvedGameIdSources | undefined) =>
					prev ? { ...prev, cookieGameId: gameId } : undefined,
			);
		},
		[queryClient],
	);
};

export { useSetActiveGame };
