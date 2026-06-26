import { createFileRoute } from "@tanstack/react-router";
import { getGameConfig } from "#/features/game/registry/game-registry";

export const Route = createFileRoute("/$gameId/build/create")({
	component: function CreateBuildPage() {
		const { gameId } = Route.useParams();
		const config = getGameConfig(gameId);
		return <>{config?.PAGES.renderCreateBuild()}</>;
	},
});
