import { Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { setGame } from "#/features/game/store.ts";

const HomePage = () => {
	useEffect(() => setGame("none"));

	return <Title order={1}>Home Page</Title>;
};

const Route = createFileRoute("/")({
	component: HomePage,
});

export { Route };
