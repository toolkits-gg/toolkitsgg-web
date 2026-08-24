import { Alert } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { ReviewQueue } from "#/documents/admin/ReviewQueue";
import { useGameId } from "#/features/game/use-game-id";
import { getGameBuilds } from "#/games-registry/builds-registry";

const AdminQueue = () => {
	const gameId = useGameId();
	const builds = getGameBuilds(gameId);
	if (!builds) {
		return <Alert color="yellow">{gameId} has no builds to moderate.</Alert>;
	}
	return <ReviewQueue builds={builds} />;
};

const Route = createFileRoute("/admin/queue")({
	component: AdminQueue,
});

export { Route };
