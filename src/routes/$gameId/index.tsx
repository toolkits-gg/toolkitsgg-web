import { createFileRoute } from "@tanstack/react-router";
import { GameHomePage } from "#/components/pages/GameHome";
import { getGamePages } from "#/games-registry/pages-registry";

export const Route = createFileRoute("/$gameId/")({
	component: function GameHome() {
		const { gameId } = Route.useParams();
		const pages = getGamePages(gameId);
		return <>{pages?.renderHome?.() ?? <GameHomePage gameId={gameId} />}</>;
	},
});
