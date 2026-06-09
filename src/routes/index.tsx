import { Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

const Route = createFileRoute("/")({
	component: () => <Title order={1}>Home Page</Title>,
});

export { Route };
