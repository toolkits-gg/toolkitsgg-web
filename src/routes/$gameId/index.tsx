import { createFileRoute } from "@tanstack/react-router";
import { GameHomePage } from "#/components/pages/GameHome.tsx";
import { getGamePages } from "#/game-registry/pages-registry.tsx";

export const Route = createFileRoute("/$gameId/")({
	component: function GameHome() {
		const { gameId } = Route.useParams();
		const pages = getGamePages(gameId);
		return <>{pages?.renderHome?.() ?? <GameHomePage gameId={gameId} />}</>;
	},
});
