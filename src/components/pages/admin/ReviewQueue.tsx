import {
	Alert,
	Anchor,
	Badge,
	Button,
	Card,
	Center,
	Group,
	Loader,
	SegmentedControl,
	Stack,
	Text,
} from "@mantine/core";
import { Link, type LinkProps } from "@tanstack/react-router";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useState } from "react";
import { ReasonModal } from "#/components/pages/admin/ReasonModal";
import { ReviewDiff } from "#/components/pages/admin/ReviewDiff";
import { useViewerGrants } from "#/features/auth/use-viewer-grants";
import type {
	ModerationResolution,
	ModerationReviewRow,
} from "#/features/game/data/types";
import type { GameBuildsConfig } from "#/features/game/types";
import { useGameId } from "#/features/game/use-game-id";
import type { GameId } from "@/prisma";

const STATUS_VALUES = ["OPEN", "RESOLVED", "DISMISSED"] as const;

const STATUS_OPTIONS = [
	{ value: "OPEN", label: "Open" },
	{ value: "RESOLVED", label: "Resolved" },
	{ value: "DISMISSED", label: "Dismissed" },
];

type PendingAction = {
	buildId: string;
	buildName: string;
	action: ModerationResolution;
};

const ACTION_COPY: Record<
	ModerationResolution,
	{ label: string; danger: boolean; reasonRequired: boolean; blurb: string }
> = {
	APPROVE: {
		label: "Approve",
		danger: false,
		reasonRequired: false,
		blurb: "Marks the build reviewed and leaves it public.",
	},
	DISMISS: {
		label: "Dismiss",
		danger: false,
		reasonRequired: false,
		blurb: "Closes this item without changing the build.",
	},
	SET_PRIVATE: {
		label: "Make private",
		danger: true,
		reasonRequired: true,
		blurb: "Takes the build out of public view. The author keeps it.",
	},
	LOCK: {
		label: "Lock",
		danger: true,
		reasonRequired: true,
		blurb: "Hides the build and blocks the author from editing it further.",
	},
	UNLOCK: {
		label: "Unlock",
		danger: false,
		reasonRequired: false,
		blurb: "Returns the build to the author's control.",
	},
	DELETE: {
		label: "Delete",
		danger: true,
		reasonRequired: true,
		blurb: "Permanently removes the build. Only the audit entry survives.",
	},
};

/**
 * Why the build is in the queue. PUBLISHED is the one that carries information
 * the diff cannot: the content below may be a small edit, but it is reaching an
 * audience that could not see the build at all a moment ago.
 */
const REASON_COPY: Record<string, { label: string; color: string }> = {
	NEW_BUILD: { label: "New build", color: "blue" },
	PUBLISHED: { label: "Made public", color: "orange" },
	EDITED: { label: "Edited", color: "gray" },
	REPORTED: { label: "Reported", color: "red" },
};

type ReviewQueueProps = { builds: GameBuildsConfig };

const ReviewQueueCard = ({
	item,
	gameId,
	onAction,
}: {
	item: ModerationReviewRow;
	gameId: GameId;
	onAction: (pending: PendingAction) => void;
}) => {
	const { can } = useViewerGrants();
	const isOpen = item.status === "OPEN";
	const buildName = item.build?.name ?? item.currentName ?? "(deleted)";
	// Equal timestamps mean the item was filed and never touched again.
	const edited =
		new Date(item.updatedAt).getTime() !== new Date(item.createdAt).getTime();

	const buildLink: LinkProps = {
		to: "/$gameId/build/$buildId",
		params: { gameId, buildId: item.targetId },
	};

	const available: ModerationResolution[] = [
		"APPROVE",
		"DISMISS",
		"SET_PRIVATE",
		...(can("build:lock", gameId)
			? item.build?.moderatorStatus === "LOCKED"
				? (["UNLOCK"] as const)
				: (["LOCK"] as const)
			: []),
		...(can("build:delete", gameId) ? (["DELETE"] as const) : []),
	];

	return (
		<Card withBorder padding="md">
			<Stack gap="sm">
				<Group justify="space-between" wrap="nowrap">
					<Group gap="xs" wrap="nowrap">
						{item.build ? (
							<Link {...buildLink} style={{ textDecoration: "none" }}>
								<Text fw={600} c="blue">
									{buildName}
								</Text>
							</Link>
						) : (
							<Text fw={600} c="dimmed">
								{buildName}
							</Text>
						)}
						<Badge
							size="sm"
							variant="light"
							color={REASON_COPY[item.reason]?.color}
						>
							{REASON_COPY[item.reason]?.label ?? item.reason}
						</Badge>
						{item.build && (
							<Badge size="sm" variant="outline">
								{item.build.moderatorStatus}
							</Badge>
						)}
					</Group>
					<Text size="xs" c="dimmed">
						{new Date(item.createdAt).toLocaleString()}
					</Text>
				</Group>

				<Text size="sm" c="dimmed">
					by {item.author?.displayName ?? item.author?.username ?? "unknown"}
					{edited &&
						` · last edited ${new Date(item.updatedAt).toLocaleString()}`}
				</Text>

				<ReviewDiff fieldDiffs={item.fieldDiffs} />

				{item.currentVideoUrl && (
					<Anchor
						href={item.currentVideoUrl}
						target="_blank"
						rel="noopener noreferrer"
						size="sm"
					>
						{item.currentVideoUrl}
					</Anchor>
				)}

				{isOpen && (
					<Group gap="xs">
						{available.map((action) => (
							<Button
								key={action}
								size="xs"
								variant={ACTION_COPY[action].danger ? "light" : "default"}
								color={ACTION_COPY[action].danger ? "red" : undefined}
								onClick={() =>
									onAction({ buildId: item.targetId, buildName, action })
								}
							>
								{ACTION_COPY[action].label}
							</Button>
						))}
					</Group>
				)}
			</Stack>
		</Card>
	);
};
const ReviewQueue = ({ builds }: ReviewQueueProps) => {
	const gameId = useGameId();
	const moderation = builds.data.moderation;
	const [status, setStatus] = useQueryState(
		"status",
		parseAsStringLiteral(STATUS_VALUES).withDefault("OPEN"),
	);
	const [pending, setPending] = useState<PendingAction | null>(null);

	const queue = moderation?.useReviewQueue({ status });
	const resolve = moderation?.useBuildAction();

	if (!moderation) {
		return <Alert color="yellow">This game has no moderation tools.</Alert>;
	}

	const items = queue?.data ?? [];

	return (
		<Stack gap="md">
			<Group justify="space-between">
				<SegmentedControl
					data={STATUS_OPTIONS}
					value={status}
					onChange={(next) => void setStatus(next as typeof status)}
				/>
				<Text size="sm" c="dimmed">
					{items.length} item{items.length === 1 ? "" : "s"}
				</Text>
			</Group>

			{queue?.isPending ? (
				<Center p="xl">
					<Loader />
				</Center>
			) : items.length === 0 ? (
				<Text c="dimmed">Nothing to review.</Text>
			) : (
				items.map((item) => (
					<ReviewQueueCard
						key={item.id}
						item={item}
						gameId={gameId}
						onAction={setPending}
					/>
				))
			)}

			{pending && (
				<ReasonModal
					opened
					title={`${ACTION_COPY[pending.action].label} build`}
					description={`${pending.buildName}: ${ACTION_COPY[pending.action].blurb}`}
					confirmLabel={ACTION_COPY[pending.action].label}
					danger={ACTION_COPY[pending.action].danger}
					reasonRequired={ACTION_COPY[pending.action].reasonRequired}
					onCancel={() => setPending(null)}
					onConfirm={(reason) => {
						resolve?.mutate({
							buildId: pending.buildId,
							action: pending.action,
							reason: reason || undefined,
						});
						setPending(null);
					}}
				/>
			)}
		</Stack>
	);
};

export { ReviewQueue };
