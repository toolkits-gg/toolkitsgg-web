import { Badge, Card, Group, Stack, Text } from "@mantine/core";
import { useNetwork } from "@mantine/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { useEffectiveUserId } from "#/features/sync/local-data/identity/use-effective-user-id";
import { useSession } from "#/integrations/better-auth/auth-client";

function LocalProfileHome() {
	const { data: session } = useSession();
	const effective = useEffectiveUserId();
	const { online } = useNetwork();

	return (
		<Stack gap="lg">
			<Card withBorder>
				<Stack gap="xs">
					<Group gap="xs">
						<Text fw={600}>Identity</Text>
						<Badge color={effective.kind === "auth" ? "green" : "gray"}>
							{effective.kind}
						</Badge>
						<Badge color={online ? "blue" : "red"}>
							{online ? "online" : "offline"}
						</Badge>
					</Group>
					<Text size="sm" c="dimmed">
						{session?.user
							? `Signed in as ${session.user.email}`
							: "Signed out — writes are stored locally until you sign in."}
					</Text>
					<Text size="xs" c="dimmed">
						local id: {effective.id || "—"}
					</Text>
				</Stack>
			</Card>
		</Stack>
	);
}

const Route = createFileRoute("/profile/")({
	component: LocalProfileHome,
});

export { Route };
