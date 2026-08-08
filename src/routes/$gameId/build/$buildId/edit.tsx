import { createFileRoute } from "@tanstack/react-router";
import { BuildEditPage } from "#/components/pages/BuildEdit";
import { getGameBuilds } from "#/games-registry/builds-registry";

const EditBuild = () => {
	const { gameId, buildId } = Route.useParams();
	const builds = getGameBuilds(gameId);
	if (!builds) return null;
	return <BuildEditPage builds={builds} buildId={buildId} />;
};

export const Route = createFileRoute("/$gameId/build/$buildId/edit")({
	component: EditBuild,
});
