import { Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

const App = () => <Title order={1}>Home Page</Title>;

const Route = createFileRoute("/")({ component: App });

export { Route };
