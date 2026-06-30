import { createFileRoute } from "@tanstack/react-router";
import { getGamePages } from "#/registry/game-pages-registry.tsx";

export const Route = createFileRoute("/$gameId/items")({
	component: function ItemsPage() {
		const { gameId } = Route.useParams();
		const pages = getGamePages(gameId);
		return <>{pages?.renderItemLookup()}</>;
	},
});
