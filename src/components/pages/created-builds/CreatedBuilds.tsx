import {
	Badge,
	Card,
	Center,
	EmptyState,
	Group,
	Loader,
	SimpleGrid,
	Text,
} from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { AppImage } from "#/components/AppImage.tsx";
import type {
	CreatedBuildSummary,
	GameCreatedBuildsData,
} from "#/features/game/data/types.ts";
import type { ProfileTabViewMode } from "#/features/game/types.ts";
import { useGameId } from "#/features/game/use-game-id.ts";
import type { BuildVisibility, GameId } from "@/prisma";
import { useCreatedBuilds } from "./use-created-builds.ts";

type CreatedBuildsPageProps = {
	data: GameCreatedBuildsData;
	viewMode: ProfileTabViewMode;
};

const VISIBILITY_COLORS: Record<BuildVisibility, string> = {
	PUBLIC: "green",
	UNLISTED: "yellow",
	PRIVATE: "gray",
};

const BuildCard = ({
	build,
	gameId,
}: {
	build: CreatedBuildSummary;
	gameId: GameId;
}) => {
	const imageSrc = build.thumbnailUrl ?? build.imageUrl ?? undefined;
	return (
		<Link
			to="/$gameId/build/$buildId"
			params={{ gameId, buildId: build.id }}
			style={{ textDecoration: "none", color: "inherit" }}
		>
			<Card withBorder padding="sm" radius="md">
				<Card.Section>
					<AppImage
						src={imageSrc}
						alt={build.name}
						h={140}
						fallbackSrc="/placeholder-build.png"
					/>
				</Card.Section>
				<Group justify="space-between" mt="sm" wrap="nowrap">
					<Text fw={600} lineClamp={1}>
						{build.name}
					</Text>
					<Badge
						color={VISIBILITY_COLORS[build.visibility] ?? "gray"}
						variant="light"
						size="sm"
					>
						{build.visibility}
					</Badge>
				</Group>
			</Card>
		</Link>
	);
};

/** Profile-tab grid of a user's created builds (self or public view). */
const CreatedBuildsPage = ({ data, viewMode }: CreatedBuildsPageProps) => {
	const gameId = useGameId();
	const { builds, isLoading, isPublicView } = useCreatedBuilds({
		data,
		viewMode,
	});

	if (isLoading) {
		return (
			<Center py="xl">
				<Loader />
			</Center>
		);
	}

	if (builds.length === 0) {
		return (
			<EmptyState
				title="No builds yet"
				description={
					isPublicView
						? "This user hasn't shared any public builds."
						: "You haven't created any builds yet."
				}
			/>
		);
	}

	return (
		<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
			{builds.map((build) => (
				<BuildCard key={build.id} build={build} gameId={gameId} />
			))}
		</SimpleGrid>
	);
};

export { CreatedBuildsPage };
