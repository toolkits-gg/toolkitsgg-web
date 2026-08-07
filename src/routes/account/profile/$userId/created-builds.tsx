import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { useEffect } from "react";
import { useGameId } from "#/features/game/use-game-id.ts";
import { ProfileTabPlaceholder } from "#/features/user/ProfileTabPlaceholder.tsx";
import {
	buildTabHead,
	loadProfileTabData,
} from "#/features/user/profile-tab-head.ts";
import { getGamePages } from "#/game-registry/game-pages-registry.tsx";
import { isRegisteredGameId } from "#/registry/game-public-registry.tsx";
import type { GameId } from "@/prisma";

type CreatedBuildsSearch = {
	gameId?: GameId;
};

const parentRouteApi = getRouteApi("/account/profile/$userId");

const CreatedBuilds = () => {
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

	const pages = gameId !== "none" ? getGamePages(gameId) : undefined;

	return (
		<>
			{pages?.renderCreatedBuilds?.({
				mode: isOwner ? { kind: "self" } : { kind: "public", userId },
			}) ?? <ProfileTabPlaceholder title="Created Builds" />}
		</>
	);
};

const Route = createFileRoute("/account/profile/$userId/created-builds")({
	validateSearch: (search: Record<string, unknown>): CreatedBuildsSearch => {
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
			"Created Builds",
		),
	}),
	component: CreatedBuilds,
});

export { Route };
