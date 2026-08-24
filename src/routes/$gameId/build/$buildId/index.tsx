import { createFileRoute } from "@tanstack/react-router";
import { BuildViewDocument } from "#/documents/build/build-view/BuildViewDocument.tsx";
import { getGameBuilds } from "#/games-registry/builds-registry";

const ViewBuild = () => {
	const { gameId, buildId } = Route.useParams();
	const builds = getGameBuilds(gameId);
	if (!builds) return null;
	return <BuildViewDocument builds={builds} buildId={buildId} />;
};

export const Route = createFileRoute("/$gameId/build/$buildId/")({
	component: ViewBuild,
});
