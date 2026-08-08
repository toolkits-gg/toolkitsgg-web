import {
	Button,
	Center,
	EmptyState,
	Group,
	Loader,
	SimpleGrid,
	Stack,
} from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { LuPlus } from "react-icons/lu";
import { BuildCard } from "#/components/pages/build/BuildCard";
import { AddToCollectionMenu } from "#/components/pages/build/build-view/AddToCollectionMenu";
import { useCreatedBuilds } from "#/components/pages/created-builds/use-created-builds";
import type {
	GameBuildsConfig,
	ProfileTabViewMode,
} from "#/features/game/types";
import { useGameId } from "#/features/game/use-game-id";

type CreatedBuildsPageProps = {
	builds: GameBuildsConfig;
	viewMode: ProfileTabViewMode;
};

/** Profile-tab grid of a user's created builds (self or public view). */
const CreatedBuildsPage = ({ builds, viewMode }: CreatedBuildsPageProps) => {
	const gameId = useGameId();
	const {
		builds: list,
		isLoading,
		isPublicView,
	} = useCreatedBuilds({
		data: builds.data.builds,
		viewMode,
	});

	if (isLoading) {
		return (
			<Center py="xl">
				<Loader />
			</Center>
		);
	}

	return (
		<Stack gap="md">
			{!isPublicView && gameId !== "none" && (
				<Group justify="flex-end">
					<Link
						to="/$gameId/build/create"
						params={{ gameId }}
						style={{ textDecoration: "none" }}
					>
						<Button leftSection={<LuPlus size={16} />}>New build</Button>
					</Link>
				</Group>
			)}

			{list.length === 0 ? (
				<EmptyState
					title="No builds yet"
					description={
						isPublicView
							? "This user hasn't shared any public builds."
							: "You haven't created any builds yet."
					}
				/>
			) : (
				<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
					{list.map((build) => (
						<BuildCard
							key={build.id}
							build={build}
							gameId={gameId}
							showVisibility={!isPublicView}
							actions={
								isPublicView ? undefined : (
									<AddToCollectionMenu
										build={build}
										collections={builds.data.collections}
									/>
								)
							}
						/>
					))}
				</SimpleGrid>
			)}
		</Stack>
	);
};

export { CreatedBuildsPage };
