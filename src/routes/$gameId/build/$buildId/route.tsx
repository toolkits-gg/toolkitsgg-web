import { createFileRoute } from "@tanstack/react-router";
import { getGamePages } from "#/registry/game-pages-registry.tsx";

export const Route = createFileRoute("/$gameId/build/$buildId")({
	component: function CreateBuildPage() {
		const { gameId } = Route.useParams();
		const pages = getGamePages(gameId);
		return <>{pages?.renderViewBuild()}</>;
	},
});
