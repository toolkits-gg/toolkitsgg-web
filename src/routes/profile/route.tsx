import { Box, Stack } from "@mantine/core";
import { useNetwork } from "@mantine/hooks";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ProfileHeader } from "#/features/auth/ProfileHeader.tsx";
import { ProfileTabNav } from "#/features/auth/ProfileTabNav.tsx";
import { useSession } from "#/integrations/better-auth/auth-client";

const LocalProfileLayout = () => {
	const { data: session } = useSession();
	const { online } = useNetwork();
	const navigate = useNavigate();

	const authedUserId = session?.user?.id;
	useEffect(() => {
		if (online && authedUserId) {
			navigate({
				to: "/account/profile/$userId",
				params: { userId: authedUserId },
				replace: true,
			}).then(() => {
				// placeholder - no action needed
			});
		}
	}, [online, authedUserId, navigate]);

	return (
		<Stack gap={0}>
			<ProfileHeader isOwner={true} />
			<ProfileTabNav basePath="/profile" showDataSync={false} />
			<Box p="md">
				<Outlet />
			</Box>
		</Stack>
	);
};

const Route = createFileRoute("/profile")({
	component: LocalProfileLayout,
});

export { Route };
