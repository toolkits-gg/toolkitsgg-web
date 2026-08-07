import {
	Anchor,
	Card,
	Container,
	Group,
	SimpleGrid,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { Link } from "@tanstack/react-router";
import type React from "react";
import { BsCollection } from "react-icons/bs";
import { GiCapeArmor } from "react-icons/gi";
import { LuExternalLink } from "react-icons/lu";
import {
	getGameLogoComponent,
	getGameMetadata,
} from "#/game-registry/public-registry.ts";

type QuickLink = {
	label: string;
	description: string;
	to: string;
	// biome-ignore lint/suspicious/noExplicitAny: <Need to allow any type of icon component>
	icon: React.FC<any>;
};

const buildQuickLinks = (gameId: string): QuickLink[] => [
	{
		label: "Item List",
		description: "Browse every item and track what you've collected.",
		to: `/${gameId}/items`,
		icon: BsCollection,
	},
	{
		label: "Create a Build",
		description: "Put together a loadout and share it with the community.",
		to: `/${gameId}/build/create`,
		icon: GiCapeArmor,
	},
];

type GameHomePageProps = {
	gameId: string;
};
const GameHomePage = ({ gameId }: GameHomePageProps) => {
	const metadata = getGameMetadata(gameId);
	const Logo = getGameLogoComponent(gameId);
	const quickLinks = buildQuickLinks(gameId);

	return (
		<Container size="lg" py="md">
			<Stack gap="xl">
				<Group gap="md" wrap="nowrap" align="center">
					{Logo && <Logo size={64} />}
					<Stack gap={4}>
						<Title order={1}>{metadata?.label ?? gameId}</Title>
						{metadata?.description && (
							<Text c="dimmed" size="sm">
								{metadata.description}
							</Text>
						)}
					</Stack>
				</Group>

				<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
					{quickLinks.map(({ label, description, to, icon: Icon }) => (
						<Card
							key={to}
							component={Link}
							to={to}
							withBorder
							padding="md"
							radius="md"
						>
							<Group gap="sm" mb={4}>
								<Icon size={18} />
								<Text fw={600}>{label}</Text>
							</Group>
							<Text size="sm" c="dimmed">
								{description}
							</Text>
						</Card>
					))}
				</SimpleGrid>

				<Stack gap="sm">
					<Title order={2} size="h3">
						News &amp; Updates
					</Title>
					<Card withBorder padding="lg" radius="md">
						<Text size="sm" c="dimmed" ta="center">
							No {metadata?.label ?? gameId} news yet — check back soon.
						</Text>
					</Card>
				</Stack>

				{metadata?.externalResources &&
					metadata.externalResources.length > 0 && (
						<Stack gap="sm">
							<Title order={2} size="h3">
								Resources
							</Title>
							<Stack gap="xs">
								{metadata.externalResources.map(({ label, link }) => (
									<Anchor
										key={link}
										href={link}
										target="_blank"
										rel="noopener noreferrer"
										size="sm"
									>
										<Group gap={6} component="span">
											{label}
											<LuExternalLink size={14} />
										</Group>
									</Anchor>
								))}
							</Stack>
						</Stack>
					)}
			</Stack>
		</Container>
	);
};

export { GameHomePage };
