import { ActionIcon, Button, Group, Text, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useNavigate } from "@tanstack/react-router";
import { LuCamera, LuHeart, LuPencil, LuTrash2 } from "react-icons/lu";
import { AddToCollectionMenu } from "#/documents/build/build-view/AddToCollectionMenu.tsx";
import { ModeratorBuildActions } from "#/documents/build/build-view/ModeratorBuildActions.tsx";
import { ShareBuildButton } from "#/documents/build/build-view/ShareBuildButton.tsx";
import type { CreatedBuildRecord } from "#/features/game/data/types.ts";
import type { GameBuildsConfig } from "#/features/game/types.ts";
import { useGameId } from "#/features/game/use-game-id.ts";

const LOCAL_LIKE_HINT =
	"Saved on this device. Sign in and it counts toward the build's total.";

type BuildActionsProps = {
	build: CreatedBuildRecord;
	builds: GameBuildsConfig;
	isOwner: boolean;
	isAuthed: boolean;
	screenshotLoading: boolean;
	onScreenshot: () => void;
};

const BuildActions = ({
	build,
	builds,
	isOwner,
	isAuthed,
	screenshotLoading,
	onScreenshot,
}: BuildActionsProps) => {
	const gameId = useGameId();
	const navigate = useNavigate();
	const remove = builds.data.builds.useRemove();
	const upvote = builds.data.upvotes.useUpvote();
	const removeUpvote = builds.data.upvotes.useRemoveUpvote();
	const { data: hasUpvoted } = builds.data.upvotes.useHasUpvoted(build.id);

	const likeButton = (
		<Button
			size="compact-sm"
			variant={hasUpvoted ? "filled" : "light"}
			leftSection={<LuHeart size={14} />}
			loading={upvote.isPending || removeUpvote.isPending}
			onClick={() =>
				hasUpvoted
					? removeUpvote.mutate({ buildId: build.id, build })
					: upvote.mutate({ buildId: build.id, build })
			}
		>
			{build.upvoteCount ?? 0}
		</Button>
	);

	const confirmDelete = () =>
		modals.openConfirmModal({
			title: "Delete build",
			children: (
				<Text size="sm">
					Delete “{build.name}”? This can&rsquo;t be undone.
				</Text>
			),
			labels: { confirm: "Delete", cancel: "Cancel" },
			confirmProps: { color: "red" },
			onConfirm: () => {
				remove.mutate(
					{ buildId: build.id },
					{
						onSuccess: () => {
							if (gameId !== "none") {
								void navigate({ to: "/$gameId", params: { gameId } });
							}
						},
					},
				);
			},
		});

	return (
		<Group gap="xs" wrap="nowrap">
			{isAuthed ? (
				likeButton
			) : (
				<Tooltip label={LOCAL_LIKE_HINT} multiline w={240}>
					{likeButton}
				</Tooltip>
			)}

			<AddToCollectionMenu
				build={build}
				collections={builds.data.collections}
				viewerOwnsBuild={isOwner}
			/>

			<ShareBuildButton
				buildDraft={{
					loadout: build.loadout,
					name: build.name,
					tags: build.tags,
					videoUrl: build.videoUrl ?? "",
					referenceUrl: build.referenceUrl ?? "",
				}}
				buildPath={
					isAuthed && gameId !== "none"
						? `/${gameId}/build/${build.id}`
						: undefined
				}
			/>

			<Tooltip label="Screenshot">
				<ActionIcon
					variant="subtle"
					aria-label="Screenshot"
					loading={screenshotLoading}
					onClick={onScreenshot}
				>
					<LuCamera size={16} />
				</ActionIcon>
			</Tooltip>

			{isOwner && gameId !== "none" && (
				<>
					<Tooltip label="Edit">
						<ActionIcon
							variant="subtle"
							aria-label="Edit build"
							onClick={() =>
								void navigate({
									to: "/$gameId/build/$buildId/edit",
									params: { gameId, buildId: build.id },
								})
							}
						>
							<LuPencil size={16} />
						</ActionIcon>
					</Tooltip>
					<Tooltip label="Delete">
						<ActionIcon
							variant="subtle"
							color="red"
							aria-label="Delete build"
							onClick={confirmDelete}
						>
							<LuTrash2 size={16} />
						</ActionIcon>
					</Tooltip>
				</>
			)}

			<ModeratorBuildActions build={build} builds={builds} />
		</Group>
	);
};

export { BuildActions };
