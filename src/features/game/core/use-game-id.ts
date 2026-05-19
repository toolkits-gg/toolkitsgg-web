import { useRouteContext } from "@tanstack/react-router";
import { useSelector } from "@tanstack/react-store";
import { gameStore } from "#/features/game/core/store";
import type { GameId } from "@/prisma";

/**
 * Client store wins (when set), so GameSwitcher clicks update the UI instantly;
 * otherwise fall back to the SSR value (from initial paint/hydration).
 */
const useGameId = (): GameId => {
	const { ssrGameId } = useRouteContext({ from: "__root__" });
	const clientGameId = useSelector(gameStore, (s) => s.gameId);
	return clientGameId ?? ssrGameId ?? "none";
};

export { useGameId };
