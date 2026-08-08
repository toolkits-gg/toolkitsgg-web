import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Badge, Group, Paper, Stack, Text } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { LuGripVertical } from "react-icons/lu";
import type {
	CreatedBuildSummary,
	GameBuildCollectionsData,
} from "#/features/game/data/types";

type BuildCollectionBuildOrderProps = {
	collections: GameBuildCollectionsData;
	collectionId: string;
	builds: CreatedBuildSummary[];
	/** Marks the first row as the primary, which only matters in the variants layout. */
	showPrimary: boolean;
};

/**
 * Owner-only reordering of a collection's members.
 *
 * `builds` seeds local drag state once. Callers key this component on the member
 * order so a refetch that actually changes it remounts with a fresh seed.
 */
const BuildCollectionBuildOrder = ({
	collections,
	collectionId,
	builds,
	showPrimary,
}: BuildCollectionBuildOrderProps) => {
	const [rows, handlers] = useListState(builds);
	const setBuildOrder = collections.useSetBuildOrder();

	return (
		<DragDropContext
			onDragEnd={({ source, destination }) => {
				if (!destination || destination.index === source.index) return;
				const next = [...rows];
				const [moved] = next.splice(source.index, 1);
				next.splice(destination.index, 0, moved);
				handlers.setState(next);
				setBuildOrder.mutate({
					collectionId,
					buildIds: next.map((build) => build.id),
				});
			}}
		>
			<Droppable droppableId="collection-builds" direction="vertical">
				{(dropProvided) => (
					<Stack
						gap="xs"
						ref={dropProvided.innerRef}
						{...dropProvided.droppableProps}
					>
						{rows.map((build, index) => (
							<Draggable key={build.id} draggableId={build.id} index={index}>
								{(dragProvided, dragSnapshot) => (
									<Paper
										withBorder
										p="xs"
										radius="sm"
										ref={dragProvided.innerRef}
										{...dragProvided.draggableProps}
										shadow={dragSnapshot.isDragging ? "md" : undefined}
									>
										<Group gap="sm" wrap="nowrap">
											<Group
												{...dragProvided.dragHandleProps}
												aria-label={`Reorder ${build.name}`}
												c="dimmed"
												style={{ cursor: "grab" }}
											>
												<LuGripVertical size={16} />
											</Group>
											<Text fz="sm" lineClamp={1} style={{ flex: 1 }}>
												{build.name}
											</Text>
											{showPrimary && index === 0 && (
												<Badge variant="light" size="sm">
													Primary
												</Badge>
											)}
										</Group>
									</Paper>
								)}
							</Draggable>
						))}
						{dropProvided.placeholder}
					</Stack>
				)}
			</Droppable>
		</DragDropContext>
	);
};

export { BuildCollectionBuildOrder };
