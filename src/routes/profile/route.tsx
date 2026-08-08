import { Box, Stack } from "@mantine/core";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { ProfileHeader } from "#/features/user/ProfileHeader";
import { ProfileTabNav } from "#/features/user/ProfileTabNav";
import { getSessionUserServerFn } from "#/features/user/session-user";

const LocalProfileLayout = () => (
	<Stack gap={0}>
		<ProfileHeader isOwner={true} />
		<ProfileTabNav basePath="/profile" showDataSync />
		<Box p="md">
			<Outlet />
		</Box>
	</Stack>
);

const Route = createFileRoute("/profile")({
	// This tree is the signed-out view; an account has a real profile to go to.
	// Resolved on the server so the redirect happens before anything renders,
	// which also keeps the subtree from reading a session that SSR did not see.
	loader: async () => {
		const user = await getSessionUserServerFn();
		if (user) {
			throw redirect({
				to: "/account/profile/$userId",
				params: { userId: user.id },
				replace: true,
			});
		}
		return null;
	},
	component: LocalProfileLayout,
});

export { Route };
