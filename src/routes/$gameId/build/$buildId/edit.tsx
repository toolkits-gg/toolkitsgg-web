import { createFileRoute } from "@tanstack/react-router";
import { BuildEditDocument } from "#/documents/build/BuildEditDocument.tsx";
import { getGameBuilds } from "#/games-registry/builds-registry";

const EditBuild = () => {
	const { gameId, buildId } = Route.useParams();
	const builds = getGameBuilds(gameId);
	if (!builds) return null;
	return <BuildEditDocument builds={builds} buildId={buildId} />;
};

export const Route = createFileRoute("/$gameId/build/$buildId/edit")({
	component: EditBuild,
});
