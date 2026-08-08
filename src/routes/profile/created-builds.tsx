import { createFileRoute } from "@tanstack/react-router";
import { CreatedBuildsPage } from "#/components/pages/created-builds/CreatedBuilds";
import { useGameId } from "#/features/game/use-game-id";
import { getGameBuilds } from "#/games-registry/builds-registry";

const CreatedBuilds = () => {
	const gameId = useGameId();
	const builds = getGameBuilds(gameId);
	if (!builds) return null;
	return <CreatedBuildsPage builds={builds} viewMode={{ kind: "self" }} />;
};

const Route = createFileRoute("/profile/created-builds")({
	component: CreatedBuilds,
});

export { Route };
