import { Stack, Text, Title } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import {
	buildTabHead,
	loadProfileTabData,
} from "#/features/auth/profile-tab-head.ts";

function CollectionStats() {
	return (
		<Stack gap="sm">
			<Title order={3}>Collection Stats</Title>
			<Text c="dimmed">Content coming soon.</Text>
		</Stack>
	);
}

const Route = createFileRoute("/account/profile/$userId/collection-stats")({
	loader: async ({ params, context }) =>
		loadProfileTabData(params.userId, context.queryClient),
	head: ({ loaderData }) => ({
		meta: buildTabHead(
			loaderData?.displayName ?? "Toolkits.gg User",
			"Collection Stats",
		),
	}),
	component: CollectionStats,
});

export { Route };
