import { createFileRoute } from "@tanstack/react-router";
import { BuildCollectionsPage } from "#/components/pages/build-collections/BuildCollections";
import { useGameId } from "#/features/game/use-game-id";
import { getGameBuilds } from "#/games-registry/builds-registry";

const BuildCollections = () => {
	const gameId = useGameId();
	const builds = getGameBuilds(gameId);
	if (!builds) return null;
	return (
		<BuildCollectionsPage
			data={builds.data.collections}
			viewMode={{ kind: "self" }}
		/>
	);
};

const Route = createFileRoute("/profile/build-collections")({
	component: BuildCollections,
});

export { Route };
