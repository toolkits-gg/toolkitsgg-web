import { createFileRoute } from "@tanstack/react-router";
import { getGameConfig } from "#/features/game/registry/game-registry.tsx";

export const Route = createFileRoute("/$gameId/build/$buildId/edit")({
	component: function CreateBuildPage() {
		const { gameId } = Route.useParams();
		const config = getGameConfig(gameId);
		return <>{config?.PAGES.renderEditBuild()}</>;
	},
});
