import { createFileRoute } from "@tanstack/react-router";
import { useGameId } from "#/features/game/use-game-id.ts";
import { ProfileTabPlaceholder } from "#/features/user/ProfileTabPlaceholder.tsx";
import { getGamePages } from "#/registry/game-pages-registry.tsx";

function CreatedBuilds() {
	const gameId = useGameId();
	const pages = getGamePages(gameId);
	return (
		<>
			{pages?.renderCreatedBuilds?.({ mode: { kind: "self" } }) ?? (
				<ProfileTabPlaceholder title="Created Builds" />
			)}
		</>
	);
}

const Route = createFileRoute("/profile/created-builds")({
	component: CreatedBuilds,
});

export { Route };
