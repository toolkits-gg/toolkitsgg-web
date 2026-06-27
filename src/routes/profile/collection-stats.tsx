import { createFileRoute } from "@tanstack/react-router";
import { ProfileTabPlaceholder } from "#/features/user/ProfileTabPlaceholder.tsx";

const Route = createFileRoute("/profile/collection-stats")({
	component: () => <ProfileTabPlaceholder title="Collection Stats" />,
});

export { Route };
