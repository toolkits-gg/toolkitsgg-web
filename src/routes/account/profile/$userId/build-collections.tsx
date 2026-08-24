import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { useEffect } from "react";
import { BuildCollectionsPage } from "#/documents/build-collections/BuildCollections";
import { useGameId } from "#/features/game/use-game-id";
import {
	buildTabHead,
	loadProfileTabData,
} from "#/features/user/profile-tab-head";
import { getGameBuilds } from "#/games-registry/builds-registry";
import { isRegisteredGameId } from "#/games-registry/public-registry";
import type { GameId } from "@/prisma";

type BuildCollectionsSearch = {
	gameId?: GameId;
};

const parentRouteApi = getRouteApi("/account/profile/$userId");

const BuildCollections = () => {
	const { userId } = Route.useParams();
	const { isOwner } = parentRouteApi.useLoaderData();
	const { gameId: urlGameId } = Route.useSearch();
	const navigate = Route.useNavigate();
	const gameId = useGameId();

	// Mirror the active gameId back to the URL so the page state is shareable
	// and so picking a different game via GameSwitcher keeps the URL in sync.
	useEffect(() => {
		if (gameId === "none") return;
		if (urlGameId === gameId) return;
		void navigate({
			search: (prev) => ({ ...prev, gameId }),
			replace: true,
		});
	}, [gameId, urlGameId, navigate]);

	const builds = getGameBuilds(gameId);
	if (!builds) return null;

	return (
		<BuildCollectionsPage
			data={builds.data.collections}
			viewMode={isOwner ? { kind: "self" } : { kind: "public", userId }}
		/>
	);
};

const Route = createFileRoute("/account/profile/$userId/build-collections")({
	validateSearch: (search: Record<string, unknown>): BuildCollectionsSearch => {
		const raw = search.gameId;
		if (typeof raw === "string" && isRegisteredGameId(raw)) {
			return { gameId: raw };
		}
		return {};
	},
	loader: async ({ params, context }) =>
		loadProfileTabData(params.userId, context.queryClient),
	head: ({ loaderData }) => ({
		meta: buildTabHead(
			loaderData?.displayName ?? "Toolkits.gg User",
			"Build Collections",
		),
	}),
	component: BuildCollections,
});

export { Route };
