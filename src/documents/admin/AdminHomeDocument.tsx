import { Badge, Card, Group, List, Stack, Text, Title } from "@mantine/core";
import { capabilitiesForGrants } from "#/features/auth/capabilities.ts";
import { useViewerGrants } from "#/features/auth/use-viewer-grants.ts";
import { useGameId } from "#/features/game/use-game-id.ts";
import { getGameBuilds } from "#/games-registry/builds-registry.ts";

const OpenReviewCount = () => {
	const gameId = useGameId();
	const moderation = getGameBuilds(gameId)?.data.moderation;
	const count = moderation?.useOpenReviewCount();

	if (!moderation) return null;

	return (
		<Card withBorder padding="md">
			<Text size="sm" c="dimmed">
				Open review items for {gameId}
			</Text>
			<Title order={3}>{count?.data ?? "-"}</Title>
		</Card>
	);
};

const AdminHomeDocument = () => {
	const gameId = useGameId();
	const { grants } = useViewerGrants();
	const capabilities = capabilitiesForGrants(grants, gameId);

	return (
		<Stack gap="md">
			<OpenReviewCount />

			<Card withBorder padding="md">
				<Stack gap="xs">
					<Text fw={600}>Your roles</Text>
					<Group gap="xs">
						{grants.map((grant) => (
							<Badge key={`${grant.role}-${grant.gameId}`} variant="light">
								{grant.gameId === "none"
									? `${grant.role} (site-wide)`
									: `${grant.role} · ${grant.gameId}`}
							</Badge>
						))}
					</Group>
				</Stack>
			</Card>

			<Card withBorder padding="md">
				<Stack gap="xs">
					<Text fw={600}>What that lets you do here</Text>
					<List size="sm">
						{capabilities.map((capability) => (
							<List.Item key={capability}>{capability}</List.Item>
						))}
					</List>
				</Stack>
			</Card>
		</Stack>
	);
};

export { AdminHomeDocument };
