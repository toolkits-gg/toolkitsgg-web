import { createFileRoute } from "@tanstack/react-router";
import { ProfileTabPlaceholder } from "#/features/user/ProfileTabPlaceholder.tsx";

const Route = createFileRoute("/profile/liked-builds")({
	component: () => <ProfileTabPlaceholder title="Liked Builds" />,
});

export { Route };
