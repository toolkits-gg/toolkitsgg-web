import {
	Button,
	Center,
	EmptyState,
	Group,
	Loader,
	SimpleGrid,
	Stack,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { LuPlus } from "react-icons/lu";
import { BuildCollectionCard } from "#/documents/build-collections/BuildCollectionCard.tsx";
import { BuildCollectionForm } from "#/documents/build-collections/BuildCollectionForm.tsx";
import { useBuildCollections } from "#/documents/build-collections/use-build-collections.ts";
import type { GameBuildCollectionsData } from "#/features/game/data/types.ts";
import type { ProfileTabViewMode } from "#/features/game/types.ts";
import { useGameId } from "#/features/game/use-game-id.ts";

type BuildCollectionsPageProps = {
	data: GameBuildCollectionsData;
	viewMode: ProfileTabViewMode;
};

/** Profile-tab list of a user's build collections (self or public view). */
export const BuildCollectionsPage = ({
	data,
	viewMode,
}: BuildCollectionsPageProps) => {
	const gameId = useGameId();
	const { collections, isLoading, isPublicView } = useBuildCollections({
		data,
		viewMode,
	});

	const openCreateModal = () =>
		modals.open({
			title: "New collection",
			children: <BuildCollectionForm collections={data} />,
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
			{!isPublicView && (
				<Group justify="flex-end">
					<Button leftSection={<LuPlus size={16} />} onClick={openCreateModal}>
						New collection
					</Button>
				</Group>
			)}

			{collections.length === 0 ? (
				<EmptyState
					title="No collections yet"
					description={
						isPublicView
							? "This user hasn't shared any public collections."
							: "Group your builds into collections to organise and share them."
					}
				/>
			) : (
				<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
					{collections.map((collection) => (
						<BuildCollectionCard
							key={collection.id}
							collection={collection}
							collections={data}
							gameId={gameId}
							isOwner={!isPublicView}
						/>
					))}
				</SimpleGrid>
			)}
		</Stack>
	);
};
