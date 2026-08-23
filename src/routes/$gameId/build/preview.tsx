import { createFileRoute, notFound } from "@tanstack/react-router";
import { BuildPreviewPage } from "#/components/pages/BuildPreviewPage.tsx";
import {
	gameSupportsBuilds,
	getGameBuilds,
} from "#/games-registry/builds-registry";

const PreviewBuild = () => {
	const { gameId } = Route.useParams();
	const builds = getGameBuilds(gameId);
	if (!builds) return null;
	return <BuildPreviewPage builds={builds} />;
};

export const Route = createFileRoute("/$gameId/build/preview")({
	beforeLoad: ({ params }) => {
		if (!gameSupportsBuilds(params.gameId)) throw notFound();
	},
	component: PreviewBuild,
});
