import { createFileRoute } from "@tanstack/react-router";
import { LikedBuildsDocument } from "#/documents/LikedBuildsDocument.tsx";
import { useGameId } from "#/features/game/use-game-id";
import { getGameBuilds } from "#/games-registry/builds-registry";

const LikedBuilds = () => {
	const gameId = useGameId();
	const builds = getGameBuilds(gameId);
	if (!builds) return null;
	return <LikedBuildsDocument builds={builds} viewMode={{ kind: "self" }} />;
};

const Route = createFileRoute("/profile/liked-builds")({
	component: LikedBuilds,
});

export { Route };
