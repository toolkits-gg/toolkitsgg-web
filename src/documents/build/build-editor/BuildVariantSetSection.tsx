import {
	ActionIcon,
	Anchor,
	Badge,
	Button,
	Collapse,
	Group,
	Paper,
	Select,
	Stack,
	Text,
	Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { createId } from "@paralleldrive/cuid2";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LuArrowUpDown, LuCopyPlus, LuLayers, LuPencil } from "react-icons/lu";
import { BuildCollectionBuildOrder } from "#/documents/build-collections/BuildCollectionBuildOrder.tsx";
import { BuildCollectionForm } from "#/documents/build-collections/BuildCollectionForm.tsx";
import type { CreatedBuildRecord } from "#/features/game/data/types.ts";
import type { GameBuildsConfig } from "#/features/game/types.ts";
import { useGameId } from "#/features/game/use-game-id.ts";

type BuildVariantSetSectionProps = {
	builds: GameBuildsConfig;
	build: CreatedBuildRecord;
	// Persists whatever is currently in the editor.
	// Adding a variant copies the saved row, so the draft is flushed first,
	// or else the copy would silently miss every unsaved edit on screen.
	saveCurrent: () => Promise<void>;
	onError: (message: string) => void;
};
const BuildVariantSetSection = ({
	builds,
	build,
	saveCurrent,
	onError,
}: BuildVariantSetSectionProps) => {
	const gameId = useGameId();
	const navigate = useNavigate();
	const [reordering, { toggle: toggleReordering }] = useDisclosure(false);

	const variantSet = build.variantSet;
	const createCollection = builds.data.collections.useCreate();
	const addBuild = builds.data.collections.useAddBuild();
	const duplicate = builds.data.builds.useDuplicate();
	const { data: collection } = builds.data.collections.useById(
		variantSet?.collectionId ?? "",
	);

	// The flush is owned by the editor, so its mutation state isn't visible here
	const [flushing, setFlushing] = useState(false);
	const isBusy =
		flushing ||
		createCollection.isPending ||
		addBuild.isPending ||
		duplicate.isPending;

	/**
	 * Every action here navigates away from an editor holding unsaved fields, so the
	 * flush has to happen first. Nothing else in the save path reports success - the
	 * ordinary "Save changes" is confirmed by landing on the build page - so leaving
	 * without the toast would write silently.
	 */
	const saveThenLeave = async () => {
		setFlushing(true);
		try {
			await saveCurrent();
		} finally {
			setFlushing(false);
		}
		notifications.show({
			title: "Changes saved",
			message: "Your edits to this variant were saved.",
			color: "green",
		});
	};

	const handleCreateSet = async () => {
		try {
			await saveCurrent();
			const collectionId = createId();
			await createCollection.mutateAsync({
				collectionId,
				name: `${build.name} variants`,
				visibility: build.visibility,
				displayMode: "VARIANTS",
			});
			await addBuild.mutateAsync({ collectionId, buildId: build.id, build });
		} catch (cause) {
			onError(
				cause instanceof Error
					? cause.message
					: "Failed to create the variant set.",
			);
		}
	};

	const handleAddVariant = async () => {
		if (!variantSet) return;
		try {
			await saveThenLeave();
			const copy = await duplicate.mutateAsync({
				sourceBuildId: build.id,
				newBuildId: createId(),
				collectionId: variantSet.collectionId,
			});
			if (gameId !== "none") {
				await navigate({
					to: "/$gameId/build/$buildId/edit",
					params: { gameId, buildId: copy.id },
				});
			}
		} catch (cause) {
			onError(
				cause instanceof Error ? cause.message : "Failed to add the variant.",
			);
		}
	};

	const handleSwitchVariant = async (nextBuildId: string) => {
		if (nextBuildId === build.id || gameId === "none") return;
		try {
			await saveThenLeave();
			await navigate({
				to: "/$gameId/build/$buildId/edit",
				params: { gameId, buildId: nextBuildId },
			});
		} catch (cause) {
			onError(
				cause instanceof Error
					? cause.message
					: "Failed to switch to that variant.",
			);
		}
	};

	const openSetEditor = () => {
		if (!collection) return;
		modals.open({
			title: "Edit variant set",
			children: (
				<BuildCollectionForm
					collections={builds.data.collections}
					collection={collection}
				/>
			),
		});
	};

	if (!variantSet) {
		return (
			<Paper withBorder p="md" radius="md">
				<Group justify="space-between" wrap="nowrap" align="flex-start">
					<Stack gap={2}>
						<Group gap="xs">
							<LuLayers size={16} />
							<Text fw={600}>Variants</Text>
						</Group>
						<Text fz="sm" c="dimmed">
							Group this build with alternate versions of itself. They share one
							page with a dropdown to switch between them, and only you can add
							your own builds to the set.
						</Text>
					</Stack>
					<Button
						variant="default"
						loading={isBusy}
						onClick={() => void handleCreateSet()}
					>
						Make this a variant set
					</Button>
				</Group>
			</Paper>
		);
	}

	const members = collection?.builds ?? [];
	const options = members.map((member, index) => ({
		value: member.id,
		label: index === 0 ? `${member.name} (primary)` : member.name,
	}));

	return (
		<Paper withBorder p="md" radius="md">
			<Stack gap="sm">
				<Group justify="space-between" wrap="nowrap" align="flex-start">
					<Stack gap={2} style={{ minWidth: 0 }}>
						<Group gap="xs">
							<LuLayers size={16} />
							<Text fw={600}>Variants</Text>
							<Badge variant="light" size="sm">
								{variantSet.variantCount}
							</Badge>
						</Group>
						<Group gap={4} wrap="nowrap">
							{gameId !== "none" && (
								<Anchor
									fz="sm"
									renderRoot={(props) => (
										<Link
											to="/$gameId/build-collection/$collectionId"
											params={{
												gameId,
												collectionId: variantSet.collectionId,
											}}
											{...props}
										/>
									)}
								>
									{/* The collection query is what the rename mutation invalidates,
									    so reading the name from it shows the new one right away. */}
									{collection?.name ?? variantSet.name}
								</Anchor>
							)}
							{collection && (
								<Tooltip label="Edit variant set">
									<ActionIcon
										variant="subtle"
										color="gray"
										size="sm"
										aria-label="Edit variant set"
										onClick={openSetEditor}
									>
										<LuPencil size={14} />
									</ActionIcon>
								</Tooltip>
							)}
						</Group>
					</Stack>
					<Group gap="sm" wrap="nowrap">
						{members.length > 1 && (
							<Button
								variant="default"
								leftSection={<LuArrowUpDown size={16} />}
								onClick={toggleReordering}
							>
								{reordering ? "Done reordering" : "Reorder"}
							</Button>
						)}
						<Button
							variant="default"
							leftSection={<LuCopyPlus size={16} />}
							loading={isBusy}
							onClick={() => void handleAddVariant()}
						>
							Add variant
						</Button>
					</Group>
				</Group>

				{options.length > 0 && (
					<Select
						label="Editing variant"
						description="Switching saves this variant first."
						data={options}
						value={build.id}
						allowDeselect={false}
						disabled={isBusy}
						onChange={(next) => next && void handleSwitchVariant(next)}
						w={280}
					/>
				)}

				{collection && (
					<Collapse expanded={reordering} keepMounted={false}>
						<BuildCollectionBuildOrder
							key={members.map((member) => member.id).join(",")}
							collections={builds.data.collections}
							collectionId={collection.id}
							builds={members}
							showPrimary
						/>
					</Collapse>
				)}
			</Stack>
		</Paper>
	);
};

export { BuildVariantSetSection };
