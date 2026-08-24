import { ActionIcon, Badge, Card, Group, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { Link } from "@tanstack/react-router";
import { LuPencil, LuTrash2 } from "react-icons/lu";
import { VISIBILITY_COLORS } from "#/documents/build/BuildCard.tsx";
import { BuildCollectionForm } from "#/documents/build-collections/BuildCollectionForm.tsx";
import type {
	BuildCollectionSummary,
	GameBuildCollectionsData,
} from "#/features/game/data/types.ts";
import type { GameId } from "@/prisma";

type BuildCollectionCardProps = {
	collection: BuildCollectionSummary;
	collections: GameBuildCollectionsData;
	gameId: GameId;
	isOwner: boolean;
};

const BuildCollectionCard = ({
	collection,
	collections,
	gameId,
	isOwner,
}: BuildCollectionCardProps) => {
	const remove = collections.useRemove();

	const confirmDelete = () =>
		modals.openConfirmModal({
			title: "Delete collection",
			children: (
				<Text size="sm">
					Delete “{collection.name}”? The builds in it aren&rsquo;t deleted.
				</Text>
			),
			labels: { confirm: "Delete", cancel: "Cancel" },
			confirmProps: { color: "red" },
			onConfirm: () => remove.mutate({ collectionId: collection.id }),
		});

	return (
		<Card withBorder padding="md" radius="md">
			<Group justify="space-between" align="flex-start" wrap="nowrap">
				<Stack gap={4} style={{ minWidth: 0 }}>
					<Link
						to="/$gameId/build-collection/$collectionId"
						params={{ gameId, collectionId: collection.id }}
						style={{ textDecoration: "none", color: "inherit" }}
					>
						<Text fw={600} lineClamp={1}>
							{collection.name}
						</Text>
					</Link>
					{collection.description && (
						<Text fz="sm" c="dimmed" lineClamp={2}>
							{collection.description}
						</Text>
					)}
					<Text fz="xs" c="dimmed">
						{collection.buildCount}{" "}
						{collection.buildCount === 1 ? "build" : "builds"}
					</Text>
				</Stack>
				<Group gap="xs" wrap="nowrap">
					{collection.displayMode === "VARIANTS" && (
						<Badge color="primary" variant="light" size="sm">
							Variants
						</Badge>
					)}
					<Badge
						color={VISIBILITY_COLORS[collection.visibility] ?? "gray"}
						variant="light"
						size="sm"
					>
						{collection.visibility}
					</Badge>
					{isOwner && (
						<>
							<ActionIcon
								variant="subtle"
								aria-label={`Edit ${collection.name}`}
								onClick={() =>
									modals.open({
										title: "Edit collection",
										children: (
											<BuildCollectionForm
												collections={collections}
												collection={collection}
											/>
										),
									})
								}
							>
								<LuPencil size={16} />
							</ActionIcon>
							<ActionIcon
								variant="subtle"
								color="red"
								aria-label={`Delete ${collection.name}`}
								onClick={confirmDelete}
							>
								<LuTrash2 size={16} />
							</ActionIcon>
						</>
					)}
				</Group>
			</Group>
		</Card>
	);
};

export { BuildCollectionCard };
