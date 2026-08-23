import { createFileRoute } from "@tanstack/react-router";
import { BuildViewPage } from "#/components/pages/BuildViewPage.tsx";
import { getGameBuilds } from "#/games-registry/builds-registry";

const ViewBuild = () => {
	const { gameId, buildId } = Route.useParams();
	const builds = getGameBuilds(gameId);
	if (!builds) return null;
	return <BuildViewPage builds={builds} buildId={buildId} />;
};

export const Route = createFileRoute("/$gameId/build/$buildId/")({
	component: ViewBuild,
});
