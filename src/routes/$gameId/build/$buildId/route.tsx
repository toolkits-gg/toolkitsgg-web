import { createFileRoute } from "@tanstack/react-router";
import { getGameConfig } from "#/features/game/registry/game-registry.tsx";

export const Route = createFileRoute("/$gameId/build/$buildId")({
	component: function CreateBuildPage() {
		const { gameId } = Route.useParams();
		const config = getGameConfig(gameId);
		return <>{config?.PAGES.renderViewBuild()}</>;
	},
});
