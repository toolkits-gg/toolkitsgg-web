import { Center, EmptyState, Loader, SimpleGrid, Stack } from "@mantine/core";
import { BuildCard } from "#/documents/build/BuildCard.tsx";
import { AddToCollectionMenu } from "#/documents/build/build-view/AddToCollectionMenu.tsx";
import type {
	GameBuildsConfig,
	ProfileTabViewMode,
} from "#/features/game/types.ts";
import { useGameId } from "#/features/game/use-game-id.ts";
import { useSession } from "#/integrations/better-auth/auth-client.ts";

type LikedBuildsPageProps = {
	builds: GameBuildsConfig;
	viewMode: ProfileTabViewMode;
};

/**
 * Profile-tab grid of builds a user has upvoted. Viewing your own list falls back
 * to IndexedDB, so a signed-out visitor still sees what they liked; someone
 * else's list is necessarily a server read.
 */
const LikedBuildsDocument = ({ builds, viewMode }: LikedBuildsPageProps) => {
	const gameId = useGameId();
	const { data: session } = useSession();
	const isPublicView = viewMode.kind === "public";

	const publicList = builds.data.upvotes.usePublicLikedList(
		isPublicView ? viewMode.userId : null,
	);
	const ownList = builds.data.upvotes.useLikedList();
	const { data: list, isLoading } = isPublicView ? publicList : ownList;

	if (isLoading) {
		return (
			<Center py="xl">
				<Loader />
			</Center>
		);
	}

	if ((list ?? []).length === 0) {
		return (
			<EmptyState
				title="No liked builds yet"
				description={
					isPublicView
						? "This user hasn't upvoted any public builds."
						: "Builds you upvote will show up here."
				}
			/>
		);
	}

	return (
		<Stack gap="md">
			<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
				{(list ?? []).map((build) => (
					<BuildCard
						key={build.id}
						build={build}
						gameId={gameId}
						showVisibility={false}
						actions={
							isPublicView ? undefined : (
								<AddToCollectionMenu
									build={build}
									collections={builds.data.collections}
									viewerOwnsBuild={
										!!session?.user?.id && build.createdById === session.user.id
									}
								/>
							)
						}
					/>
				))}
			</SimpleGrid>
		</Stack>
	);
};

export { LikedBuildsDocument };
