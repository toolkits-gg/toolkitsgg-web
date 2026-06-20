import { createFileRoute } from "@tanstack/react-router";
import { getGameConfig } from "#/features/game/registry/game-registry";
import { useGameId } from "#/features/game/use-game-id.ts";

function CollectedItems() {
	const gameId = useGameId();
	const config = getGameConfig(gameId);
	return <>{config?.PAGES.renderCollectedItems({ mode: { kind: "self" } })}</>;
}

const Route = createFileRoute("/profile/collected-items")({
	component: CollectedItems,
});

export { Route };
