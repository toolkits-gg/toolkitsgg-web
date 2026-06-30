import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { useEffect } from "react";
import { useGameId } from "#/features/game/use-game-id.ts";
import {
	buildTabHead,
	loadProfileTabData,
} from "#/features/user/profile-tab-head.ts";
import { getGamePages } from "#/registry/game-pages-registry.tsx";
import {
	getGameMetadata,
	isRegisteredGameId,
} from "#/registry/game-public-registry.tsx";
import type { GameId } from "@/prisma";

type CollectedItemsSearch = {
	gameId?: GameId;
};

const parentRouteApi = getRouteApi("/account/profile/$userId");

const CollectedItems = () => {
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
			{pages?.renderCollectedItems({
				mode: isOwner ? { kind: "self" } : { kind: "public", userId },
			})}
		</>
	);
};

const Route = createFileRoute("/account/profile/$userId/collected-items")({
	validateSearch: (search: Record<string, unknown>): CollectedItemsSearch => {
		const raw = search.gameId;
		if (typeof raw === "string" && isRegisteredGameId(raw)) {
			return { gameId: raw };
		}
		return {};
	},
	loader: async ({ params, context, location }) => {
		const { displayName } = await loadProfileTabData(
			params.userId,
			context.queryClient,
		);
		const gameId = (location.search as CollectedItemsSearch).gameId;
		const gameLabel = gameId ? getGameMetadata(gameId)?.label : undefined;
		const tabLabel = gameLabel
			? `${gameLabel} Collected Items`
			: "Collected Items";
		return { displayName, tabLabel };
	},
	head: ({ loaderData }) => ({
		meta: buildTabHead(
			loaderData?.displayName ?? "Toolkits.gg User",
			loaderData?.tabLabel ?? "Collected Items",
		),
	}),
	component: CollectedItems,
});

export { Route };
