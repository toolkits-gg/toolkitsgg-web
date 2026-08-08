import { createFileRoute } from "@tanstack/react-router";
import { DataSyncPanel } from "#/features/sync/DataSyncPanel";
import {
	buildTabHead,
	loadProfileTabData,
} from "#/features/user/profile-tab-head";

const Route = createFileRoute("/account/profile/$userId/data-sync")({
	loader: async ({ params, context }) =>
		loadProfileTabData(params.userId, context.queryClient),
	head: ({ loaderData }) => ({
		meta: buildTabHead(
			loaderData?.displayName ?? "Toolkits.gg User",
			"Data Sync",
		),
	}),
	component: DataSyncPanel,
});

export { Route };
