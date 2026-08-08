import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { ToolkitHomePage } from "#/components/pages/ToolkitHome";
import { useSetActiveGame } from "#/features/game/use-set-active-game";

const HomePage = () => {
	const setActiveGame = useSetActiveGame();

	useEffect(() => setActiveGame(null), [setActiveGame]);

	return <ToolkitHomePage />;
};

const Route = createFileRoute("/")({
	component: HomePage,
});

export { Route };
