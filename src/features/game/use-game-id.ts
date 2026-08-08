import { useParams, useRouteContext } from "@tanstack/react-router";
import { useSelector } from "@tanstack/react-store";
import { gameStore } from "#/features/game/store";
import { getValidatedGameId } from "#/games-registry/public-registry";
import type { GameId } from "@/prisma";

/**
 * The route wins whenever the URL names a game, so a stale store can't
 * shadow the page being viewed. Otherwise the client store (when set) keeps
 * GameSwitcher clicks instant, falling back to the SSR value from initial
 * paint/hydration.
 */
const useGameId = (): GameId => {
	const { ssrGameId } = useRouteContext({ from: "__root__" });
	const params = useParams({ strict: false });
	const clientGameId = useSelector(gameStore, (s) => s.gameId);

	return (
		getValidatedGameId(params.gameId ?? "") ??
		clientGameId ??
		ssrGameId ??
		"none"
	);
};

export { useGameId };
