import { createFileRoute } from "@tanstack/react-router";
import { ProfileTabPlaceholder } from "#/features/user/ProfileTabPlaceholder.tsx";

const Route = createFileRoute("/profile/build-collections")({
	component: () => <ProfileTabPlaceholder title="Build Collections" />,
});

export { Route };
