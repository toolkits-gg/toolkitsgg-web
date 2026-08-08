import { createFileRoute, notFound } from "@tanstack/react-router";
import { BuildFeedPage } from "#/components/pages/build-feeds/BuildFeed";
import {
	gameSupportsBuilds,
	getGameBuilds,
} from "#/games-registry/builds-registry";

const FeaturedBuilds = () => {
	const { gameId } = Route.useParams();
	const builds = getGameBuilds(gameId);
	if (!builds) return null;
	return (
		<BuildFeedPage builds={builds} heading="Featured builds" feed="FEATURED" />
	);
};

export const Route = createFileRoute("/$gameId/build/featured")({
	beforeLoad: ({ params }) => {
		if (!gameSupportsBuilds(params.gameId)) throw notFound();
	},
	component: FeaturedBuilds,
});
