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
import { BuildCard } from "#/documents/build/BuildCard.tsx";
import { AddToCollectionMenu } from "#/documents/build/build-view/AddToCollectionMenu.tsx";
import { useCreatedBuilds } from "#/documents/build/created-builds/use-created-builds.ts";
import type {
	GameBuildsConfig,
	ProfileTabViewMode,
} from "#/features/game/types.ts";
import { useGameId } from "#/features/game/use-game-id.ts";

type CreatedBuildsDocumentProps = {
	builds: GameBuildsConfig;
	viewMode: ProfileTabViewMode;
};

/** Profile-tab grid of a user's created builds (self or public view). */
const CreatedBuildsDocument = ({
	builds,
	viewMode,
}: CreatedBuildsDocumentProps) => {
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

export { CreatedBuildsDocument };
