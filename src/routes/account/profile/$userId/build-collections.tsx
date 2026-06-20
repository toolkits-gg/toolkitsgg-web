import { Stack, Text, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import {
	buildTabHead,
	loadProfileTabData,
} from "#/features/auth/profile-tab-head.ts";

function BuildCollections() {
	return (
		<Stack gap="sm">
			<Title order={3}>Build Collections</Title>
			<Text c="dimmed">Content coming soon.</Text>
		</Stack>
	);
}

const Route = createFileRoute("/account/profile/$userId/build-collections")({
	loader: async ({ params, context }) =>
		loadProfileTabData(params.userId, context.queryClient),
	head: ({ loaderData }) => ({
		meta: buildTabHead(
			loaderData?.displayName ?? "Toolkits.gg User",
			"Build Collections",
		),
	}),
	component: BuildCollections,
});

export { Route };
