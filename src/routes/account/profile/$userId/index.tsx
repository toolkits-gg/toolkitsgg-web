import { createFileRoute } from "@tanstack/react-router";
import { ProfileTabPlaceholder } from "#/features/user/ProfileTabPlaceholder.tsx";

const Route = createFileRoute("/account/profile/$userId/")({
	component: () => <ProfileTabPlaceholder title="Profile" />,
});

export { Route };
