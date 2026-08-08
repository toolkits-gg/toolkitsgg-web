import { createFileRoute } from "@tanstack/react-router";
import { getGamePages } from "#/games-registry/pages-registry";

export const Route = createFileRoute("/$gameId/items")({
	component: function ItemsPage() {
		const { gameId } = Route.useParams();
		const pages = getGamePages(gameId);
		return <>{pages?.renderItemLookup()}</>;
	},
});
