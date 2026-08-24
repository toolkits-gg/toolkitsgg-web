import { Button, Divider, Menu } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LuShield } from "react-icons/lu";
import { ReasonModal } from "#/documents/admin/ReasonModal.tsx";
import { useViewerGrants } from "#/features/auth/use-viewer-grants.ts";
import type {
	CreatedBuildRecord,
	ModerationResolution,
} from "#/features/game/data/types.ts";
import type { GameBuildsConfig } from "#/features/game/types.ts";
import { useGameId } from "#/features/game/use-game-id.ts";

type PendingAction =
	| { kind: "resolution"; action: ModerationResolution }
	| { kind: "clearVideo" }
	| { kind: "clearDescription" };

const COPY: Record<string, { title: string; blurb: string; danger: boolean }> =
	{
		APPROVE: {
			title: "Approve build",
			blurb: "Marks it reviewed and leaves it public.",
			danger: false,
		},
		DISMISS: {
			title: "Dismiss review",
			blurb: "Closes any open review without changing the build.",
			danger: false,
		},
		SET_PRIVATE: {
			title: "Make private",
			blurb: "Takes it out of public view. The author keeps it.",
			danger: true,
		},
		LOCK: {
			title: "Lock build",
			blurb: "Hides it and blocks the author from editing it further.",
			danger: true,
		},
		UNLOCK: {
			title: "Unlock build",
			blurb: "Returns it to the author's control.",
			danger: false,
		},
		DELETE: {
			title: "Delete build",
			blurb: "Permanently removes it. Only the audit entry survives.",
			danger: true,
		},
		clearVideo: {
			title: "Clear video",
			blurb: "Removes the video link and leaves the rest of the build alone.",
			danger: true,
		},
		clearDescription: {
			title: "Clear description",
			blurb: "Removes the description and leaves the rest of the build alone.",
			danger: true,
		},
	};
const ModeratorBuildActions = ({
	build,
	builds,
}: {
	build: CreatedBuildRecord;
	builds: GameBuildsConfig;
}) => {
	const gameId = useGameId();
	const navigate = useNavigate();
	const { can } = useViewerGrants();
	const [pending, setPending] = useState<PendingAction | null>(null);

	const moderation = builds.data.moderation;
	const action = moderation?.useBuildAction();
	const content = moderation?.useModerateContent();

	if (!moderation || !can("build:moderate", gameId) || gameId === "none") {
		return null;
	}

	const key = pending
		? pending.kind === "resolution"
			? pending.action
			: pending.kind
		: null;

	return (
		<>
			<Menu shadow="md" position="bottom-end">
				<Menu.Target>
					<Button
						size="compact-sm"
						variant="light"
						color="orange"
						leftSection={<LuShield size={14} />}
					>
						Moderate
					</Button>
				</Menu.Target>
				<Menu.Dropdown>
					<Menu.Label>Review</Menu.Label>
					<Menu.Item
						onClick={() =>
							setPending({ kind: "resolution", action: "APPROVE" })
						}
					>
						Approve
					</Menu.Item>
					<Menu.Item
						onClick={() =>
							setPending({ kind: "resolution", action: "DISMISS" })
						}
					>
						Dismiss
					</Menu.Item>

					<Menu.Label>Content</Menu.Label>
					<Menu.Item
						onClick={() =>
							void navigate({
								to: "/$gameId/build/$buildId/edit",
								params: { gameId, buildId: build.id },
							})
						}
					>
						Edit build
					</Menu.Item>
					<Menu.Item
						disabled={!build.videoUrl}
						onClick={() => setPending({ kind: "clearVideo" })}
					>
						Clear video
					</Menu.Item>
					<Menu.Item
						disabled={!build.description}
						onClick={() => setPending({ kind: "clearDescription" })}
					>
						Clear description
					</Menu.Item>

					<Divider />
					<Menu.Item
						color="red"
						onClick={() =>
							setPending({ kind: "resolution", action: "SET_PRIVATE" })
						}
					>
						Make private
					</Menu.Item>
					{can("build:lock", gameId) && (
						<Menu.Item
							color="red"
							onClick={() => setPending({ kind: "resolution", action: "LOCK" })}
						>
							Lock
						</Menu.Item>
					)}
					{can("build:delete", gameId) && (
						<Menu.Item
							color="red"
							onClick={() =>
								setPending({ kind: "resolution", action: "DELETE" })
							}
						>
							Delete
						</Menu.Item>
					)}
				</Menu.Dropdown>
			</Menu>

			{pending && key && (
				<ReasonModal
					opened
					title={COPY[key].title}
					description={COPY[key].blurb}
					confirmLabel={COPY[key].title}
					danger={COPY[key].danger}
					reasonRequired={COPY[key].danger}
					onCancel={() => setPending(null)}
					onConfirm={(reason) => {
						if (pending.kind === "resolution") {
							action?.mutate({
								buildId: build.id,
								action: pending.action,
								reason: reason || undefined,
							});
						} else {
							content?.mutate({
								buildId: build.id,
								clearVideo: pending.kind === "clearVideo",
								clearDescription: pending.kind === "clearDescription",
								reason: reason || undefined,
							});
						}
						setPending(null);
					}}
				/>
			)}
		</>
	);
};

export { ModeratorBuildActions };
