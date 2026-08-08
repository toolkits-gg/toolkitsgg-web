import { createFileRoute } from "@tanstack/react-router";
import { useGameId } from "#/features/game/use-game-id";
import { getGamePages } from "#/games-registry/pages-registry";

function CollectedItems() {
	const gameId = useGameId();
	const pages = getGamePages(gameId);
	return <>{pages?.renderCollectedItems({ mode: { kind: "self" } })}</>;
}

const Route = createFileRoute("/profile/collected-items")({
	component: CollectedItems,
});

export { Route };
