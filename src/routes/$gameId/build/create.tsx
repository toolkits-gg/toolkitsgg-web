import { createFileRoute } from "@tanstack/react-router";
import { getGamePages } from "#/game-registry/pages-registry.tsx";

export const Route = createFileRoute("/$gameId/build/create")({
	component: function CreateBuildPage() {
		const { gameId } = Route.useParams();
		const pages = getGamePages(gameId);
		return <>{pages?.renderCreateBuild()}</>;
	},
});
