import {
	Card,
	Container,
	Group,
	SimpleGrid,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { clientEnv } from "#/env/client-env.ts";
import {
	getGameLogoComponent,
	getGameMetadata,
	REGISTERED_GAME_IDS,
} from "#/registry/game-public-registry.tsx";

const ToolkitHomePage = () => {
	return (
		<Container size="lg" py="md">
			<Stack gap="xl">
				<Stack gap={4}>
					<Title order={1}>{clientEnv.VITE_APP_NAME}</Title>
					<Text c="dimmed" size="sm">
						{clientEnv.VITE_APP_DESCRIPTION}
					</Text>
				</Stack>

				<Stack gap="sm">
					<Title order={2} size="h3">
						Choose a Game
					</Title>
					<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
						{REGISTERED_GAME_IDS.map((gameId) => {
							const metadata = getGameMetadata(gameId);
							const Logo = getGameLogoComponent(gameId);

							return (
								<Card
									key={gameId}
									component={Link}
									to={`/${gameId}`}
									withBorder
									padding="md"
									radius="md"
								>
									<Group gap="sm" wrap="nowrap">
										{Logo && <Logo size={36} />}
										<Text fw={600}>{metadata?.label ?? gameId}</Text>
									</Group>
								</Card>
							);
						})}
					</SimpleGrid>
				</Stack>

				<Stack gap="sm">
					<Title order={2} size="h3">
						News &amp; Updates
					</Title>
					<Card withBorder padding="lg" radius="md">
						<Text size="sm" c="dimmed" ta="center">
							No announcements yet — check back soon.
						</Text>
					</Card>
				</Stack>
			</Stack>
		</Container>
	);
};

export { ToolkitHomePage };
