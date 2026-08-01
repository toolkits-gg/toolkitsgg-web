import { Box, Text, Title } from "@mantine/core";
import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { getValidatedGameId } from "#/registry/game-public-registry.tsx";

const Route = createFileRoute("/$gameId")({
	beforeLoad: ({ params }) => {
		if (!getValidatedGameId(params.gameId)) throw notFound();
	},
	head: ({ params }) => ({
		links: [
			{
				rel: "icon",
				type: "image/x-icon",
				href: `/favicons/${params.gameId}/favicon.ico`,
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "32x32",
				href: `/favicons/${params.gameId}/favicon-32x32.png`,
			},
			{
				rel: "apple-touch-icon",
				href: `/favicons/${params.gameId}/apple-touch-icon.png`,
			},
		],
	}),
	notFoundComponent: () => {
		return (
			<Box p="md">
				<Title order={1}>404 - Game Not Found</Title>
				<Text>The page you are looking for does not exist.</Text>
			</Box>
		);
	},
	component: () => <Outlet />,
});

export { Route };
