import { createFileRoute, notFound } from "@tanstack/react-router";
import { BuildFeedPage } from "#/components/pages/build-feeds/BuildFeed";
import { COMMUNITY_FEED } from "#/features/game/data/utils";
import {
	gameSupportsBuilds,
	getGameBuilds,
} from "#/games-registry/builds-registry";

const CommunityBuilds = () => {
	const { gameId } = Route.useParams();
	const builds = getGameBuilds(gameId);
	if (!builds) return null;
	return (
		<BuildFeedPage
			builds={builds}
			heading="Community builds"
			feed={COMMUNITY_FEED}
		/>
	);
};

export const Route = createFileRoute("/$gameId/build/community")({
	beforeLoad: ({ params }) => {
		if (!gameSupportsBuilds(params.gameId)) throw notFound();
	},
	component: CommunityBuilds,
});
