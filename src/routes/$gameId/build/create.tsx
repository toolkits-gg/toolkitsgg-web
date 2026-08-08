import { createFileRoute, notFound } from "@tanstack/react-router";
import { BuildCreatePage } from "#/components/pages/BuildCreate";
import {
	gameSupportsBuilds,
	getGameBuilds,
} from "#/games-registry/builds-registry";

const CreateBuild = () => {
	const { gameId } = Route.useParams();
	const builds = getGameBuilds(gameId);
	if (!builds) return null;
	return <BuildCreatePage builds={builds} />;
};

export const Route = createFileRoute("/$gameId/build/create")({
	beforeLoad: ({ params }) => {
		if (!gameSupportsBuilds(params.gameId)) throw notFound();
	},
	component: CreateBuild,
});
