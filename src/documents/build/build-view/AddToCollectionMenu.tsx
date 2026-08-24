import {
	ActionIcon,
	Checkbox,
	Loader,
	Menu,
	Text,
	Tooltip,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { LuFolderPlus, LuPlus } from "react-icons/lu";
import { BuildCollectionForm } from "#/documents/build-collections/BuildCollectionForm.tsx";
import type {
	BuildCollectionSummary,
	CreatedBuildSummary,
	GameBuildCollectionsData,
} from "#/features/game/data/types.ts";

type AddToCollectionMenuProps = {
	build: CreatedBuildSummary;
	collections: GameBuildCollectionsData;
	size?: number;
	// Used for barring it from variant sets.
	viewerOwnsBuild?: boolean;
};

/**
 * The quick "add this build to a collection" selector.
 *
 * Checked state comes from the membership query so
 * the menu stays honest when the same build is toggled
 * from another card or tab.
 */
const AddToCollectionMenu = ({
	build,
	collections,
	size = 16,
	viewerOwnsBuild = true,
}: AddToCollectionMenuProps) => {
	const buildId = build.id;
	const { data: list, isLoading } = collections.useList();
	const { data: memberIds } = collections.useCollectionIdsForBuild(buildId);
	const addBuild = collections.useAddBuild();
	const removeBuild = collections.useRemoveBuild();

	const memberSet = new Set(memberIds ?? []);

	// A variant set only ever holds its owner's builds, so any set already
	// claiming this build is the viewer's own and is therefore in `list`.
	const claimingSet = (list ?? []).find(
		(collection) =>
			collection.displayMode === "VARIANTS" && memberSet.has(collection.id),
	);

	const blockedReason = (collection: BuildCollectionSummary): string | null => {
		if (collection.displayMode !== "VARIANTS") return null;
		if (memberSet.has(collection.id)) return null;
		if (!viewerOwnsBuild)
			return "A variant set can only contain builds you created.";
		if (claimingSet)
			return `Already a variant in "${claimingSet.name}". A build can belong to one variant set.`;
		return null;
	};

	const openCreateModal = () => {
		modals.open({
			title: "New collection",
			children: (
				<BuildCollectionForm
					collections={collections}
					onSaved={(collection) => {
						addBuild.mutate({ collectionId: collection.id, buildId, build });
					}}
				/>
			),
		});
	};

	return (
		<Menu shadow="md" width={260} closeOnItemClick={false} withinPortal>
			<Menu.Target>
				<Tooltip label="Add to collection">
					<ActionIcon variant="subtle" aria-label="Add to collection">
						<LuFolderPlus size={size} />
					</ActionIcon>
				</Tooltip>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Label>Your collections</Menu.Label>
				{isLoading && (
					<Menu.Item disabled leftSection={<Loader size="xs" />}>
						Loading…
					</Menu.Item>
				)}
				{!isLoading && (list ?? []).length === 0 && (
					<Menu.Item disabled>
						<Text fz="sm" c="dimmed">
							No collections yet
						</Text>
					</Menu.Item>
				)}
				{(list ?? []).map((collection) => {
					const isMember = memberSet.has(collection.id);
					const blocked = blockedReason(collection);
					const item = (
						<Menu.Item
							key={collection.id}
							disabled={!!blocked}
							leftSection={
								<Checkbox
									checked={isMember}
									readOnly
									size="xs"
									aria-hidden
									tabIndex={-1}
								/>
							}
							rightSection={
								collection.displayMode === "VARIANTS" ? (
									<Text fz="xs" c="dimmed">
										variants
									</Text>
								) : undefined
							}
							onClick={() =>
								isMember
									? removeBuild.mutate({
											collectionId: collection.id,
											buildId,
											build,
										})
									: addBuild.mutate({
											collectionId: collection.id,
											buildId,
											build,
										})
							}
						>
							{collection.name}
						</Menu.Item>
					);
					return blocked ? (
						<Tooltip
							key={collection.id}
							label={blocked}
							position="left"
							multiline
							w={220}
						>
							<div>{item}</div>
						</Tooltip>
					) : (
						item
					);
				})}
				<Menu.Divider />
				<Menu.Item
					leftSection={<LuPlus size={14} />}
					onClick={openCreateModal}
					closeMenuOnClick
				>
					New collection…
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
};

export { AddToCollectionMenu };
