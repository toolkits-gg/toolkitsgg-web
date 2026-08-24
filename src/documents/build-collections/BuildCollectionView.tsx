import {
	ActionIcon,
	Badge,
	Button,
	Center,
	Collapse,
	EmptyState,
	Group,
	Loader,
	SimpleGrid,
	Stack,
	Switch,
	Text,
	Title,
	Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { LuArrowUpDown, LuX } from "react-icons/lu";
import { NotFoundCard } from "#/components/NotFoundCard.tsx";
import { ShareLinkButton } from "#/components/ShareLinkButton.tsx";
import { BuildCard, VISIBILITY_COLORS } from "#/documents/build/BuildCard.tsx";
import { BuildCollectionBuildOrder } from "#/documents/build-collections/BuildCollectionBuildOrder.tsx";
import { BuildCollectionVariants } from "#/documents/build-collections/BuildCollectionVariants.tsx";
import type { GameBuildsConfig } from "#/features/game/types.ts";
import { useGameId } from "#/features/game/use-game-id.ts";
import { MarkdownDescription } from "#/features/markdown/MarkdownDescription.tsx";
import { useEffectiveUserId } from "#/features/sync/identity/use-effective-user-id.ts";

type BuildCollectionViewProps = {
	builds: GameBuildsConfig;
	collectionId: string;
};

/** Public page for a single collection, shareable by link. */
const BuildCollectionView = ({
	builds,
	collectionId,
}: BuildCollectionViewProps) => {
	const gameId = useGameId();
	const viewer = useEffectiveUserId();
	const { data: collection, isLoading } =
		builds.data.collections.useById(collectionId);
	const removeBuild = builds.data.collections.useRemoveBuild();
	const updateCollection = builds.data.collections.useUpdate();
	const [reordering, { toggle: toggleReordering }] = useDisclosure(false);

	if (isLoading) {
		return (
			<Center py="xl">
				<Loader />
			</Center>
		);
	}

	if (!collection) {
		return (
			<NotFoundCard
				badge="Collection not found"
				heading={<>That collection isn&rsquo;t available.</>}
				description="It may have been deleted, or its owner may have made it private."
				footerLabel="404 not found"
			/>
		);
	}

	const isOwner = collection.createdById === viewer.id;
	const asVariants = collection.displayMode === "VARIANTS";

	return (
		<Stack gap="md" p="md">
			<Group justify="space-between" align="flex-start" wrap="nowrap">
				<Stack gap={4}>
					<Title order={2}>{collection.name}</Title>
					<MarkdownDescription c="dimmed">
						{collection.description}
					</MarkdownDescription>
					<Group gap="xs">
						<Badge
							color={VISIBILITY_COLORS[collection.visibility] ?? "gray"}
							variant="light"
							size="sm"
						>
							{collection.visibility}
						</Badge>
						<Text fz="sm" c="dimmed">
							{collection.builds.length}{" "}
							{collection.builds.length === 1 ? "build" : "builds"}
						</Text>
					</Group>
				</Stack>
				<Group gap="md" wrap="nowrap" align="center">
					{isOwner && collection.builds.length > 1 && (
						<Button
							variant="default"
							size="sm"
							leftSection={<LuArrowUpDown size={16} />}
							onClick={toggleReordering}
						>
							{reordering
								? "Done reordering"
								: asVariants
									? "Reorder variants"
									: "Reorder builds"}
						</Button>
					)}
					{isOwner && (
						<Switch
							label="Variants layout"
							checked={asVariants}
							disabled={updateCollection.isPending}
							onChange={(event) => {
								const next = event.currentTarget.checked;
								if (next) {
									updateCollection.mutate({
										collectionId: collection.id,
										displayMode: "VARIANTS",
									});
									return;
								}
								modals.openConfirmModal({
									title: "Turn off the variants layout",
									children: (
										<Text size="sm">
											&ldquo;{collection.name}&rdquo; goes back to a grid of
											cards, and its builds become independent again &mdash;
											each one gets its own page and can join a different
											variant set. The collection and its builds are kept.
										</Text>
									),
									labels: { confirm: "Turn off", cancel: "Cancel" },
									onConfirm: () =>
										updateCollection.mutate({
											collectionId: collection.id,
											displayMode: "CARDS",
										}),
								});
							}}
						/>
					)}
					<ShareLinkButton
						includeGameId
						disabledReason={
							viewer.kind === "auth"
								? undefined
								: "Sign in to share. Collections you make while signed out are saved on this device only; syncing after you sign in makes them shareable."
						}
					/>
				</Group>
			</Group>

			<Collapse expanded={reordering} keepMounted={false}>
				<BuildCollectionBuildOrder
					key={collection.builds.map((member) => member.id).join(",")}
					collections={builds.data.collections}
					collectionId={collection.id}
					builds={collection.builds}
					showPrimary={asVariants}
				/>
			</Collapse>

			{collection.builds.length === 0 ? (
				<EmptyState
					title="No builds yet"
					description={
						isOwner
							? "Add builds to this collection from any build page."
							: "This collection is empty."
					}
				/>
			) : asVariants ? (
				<BuildCollectionVariants
					builds={builds}
					collection={collection}
					isOwner={isOwner}
				/>
			) : (
				<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
					{collection.builds.map((build) => (
						<BuildCard
							key={build.id}
							build={build}
							gameId={gameId}
							showVisibility={isOwner}
							actions={
								isOwner ? (
									<Tooltip label="Remove from collection">
										<ActionIcon
											variant="subtle"
											color="red"
											aria-label={`Remove ${build.name} from collection`}
											onClick={() =>
												removeBuild.mutate({
													collectionId: collection.id,
													buildId: build.id,
													build,
												})
											}
										>
											<LuX size={16} />
										</ActionIcon>
									</Tooltip>
								) : undefined
							}
						/>
					))}
				</SimpleGrid>
			)}
		</Stack>
	);
};

export { BuildCollectionView };
