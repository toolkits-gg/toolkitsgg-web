import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { ToolkitHomeDocument } from "#/documents/ToolkitHomeDocument.tsx";
import { useSetActiveGame } from "#/features/game/use-set-active-game";

const HomePage = () => {
	const setActiveGame = useSetActiveGame();

	useEffect(() => setActiveGame(null), [setActiveGame]);

	return <ToolkitHomeDocument />;
};

const Route = createFileRoute("/")({
	component: HomePage,
});

export { Route };
