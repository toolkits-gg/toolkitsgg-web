import { createFileRoute } from "@tanstack/react-router";
import { ProfileTabPlaceholder } from "#/features/user/ProfileTabPlaceholder";

const Route = createFileRoute("/account/profile/$userId/")({
	component: () => <ProfileTabPlaceholder title="Profile" />,
});

export { Route };
