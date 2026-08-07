import { createFileRoute } from "@tanstack/react-router";
import { ProfileTabPlaceholder } from "#/features/user/ProfileTabPlaceholder.tsx";
import {
	buildTabHead,
	loadProfileTabData,
} from "#/features/user/profile-tab-head.ts";

const Route = createFileRoute("/account/profile/$userId/collection-stats")({
	loader: async ({ params, context }) =>
		loadProfileTabData(params.userId, context.queryClient),
	head: ({ loaderData }) => ({
		meta: buildTabHead(
			loaderData?.displayName ?? "Toolkits.gg User",
			"Collection Stats",
		),
	}),
	component: () => <ProfileTabPlaceholder title="Collection Stats" />,
});

export { Route };
