import {
	Alert,
	Badge,
	Button,
	Divider,
	Group,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type PropsWithChildren, useEffect, useState } from "react";
import { useGameId } from "#/features/game/use-game-id";
import { getAnonUserId } from "#/features/sync/identity/anon-id";
import { deleteOp } from "#/features/sync/queue/pending-ops";
import type { PendingOp } from "#/features/sync/queue/types";
import { usePendingOps } from "#/features/sync/queue/use-pending-ops";
import { pluralChanges, runAnonDataClaim } from "#/features/sync/run-claim";
import { syncOps } from "#/features/sync/sync-runner";
import { getGameMetadata } from "#/games-registry/public-registry";
import { useSession } from "#/integrations/better-auth/auth-client";

const PendingList = ({
	ops,
	onDelete,
}: {
	ops: PendingOp[];
	onDelete: (id: string) => void;
}) => {
	if (!ops.length) {
		return (
			<Text size="sm" c="dimmed">
				No pending changes.
			</Text>
		);
	}

	return (
		<Stack gap="xs">
			{ops.map((op) => (
				<OpContainer key={op.id}>
					<Group justify="space-between" wrap="nowrap" align="center" gap="sm">
						<Stack gap={2}>
							<Group gap="xs">
								<Badge>{op.entity}</Badge>
								<Badge variant="light">{op.operation}</Badge>
								<Badge color={statusColor(op.status)} variant="outline">
									{op.status}
								</Badge>
							</Group>
							<OpSummary op={op} />
							{op.lastError ? (
								<Text size="xs" c="red">
									{op.lastError}
								</Text>
							) : null}
						</Stack>
						<Button
							size="xs"
							variant="subtle"
							color="red"
							onClick={() => onDelete(op.id)}
						>
							Discard
						</Button>
					</Group>
				</OpContainer>
			))}
		</Stack>
	);
};

function SyncedList({ ops }: { ops: PendingOp[] }) {
	if (!ops.length) return null;

	return (
		<>
			<Divider label="Completed" labelPosition="left" />
			<Stack gap="xs">
				{ops.map((op) => (
					<OpContainer key={op.id}>
						<Group gap="xs" wrap="nowrap" align="center">
							<Badge>{op.entity}</Badge>
							<Badge variant="light">{op.operation}</Badge>
							<Badge color="green" variant="outline">
								synced
							</Badge>
						</Group>
						<OpSummary op={op} />
					</OpContainer>
				))}
			</Stack>
		</>
	);
}

function OpContainer({ children }: PropsWithChildren) {
	return (
		<Stack
			gap="xs"
			p="xs"
			style={{
				background:
					"light-dark(var(--mantine-color-gray-2), var(--mantine-color-base-6))",
				borderLeft: "1px solid var(--mantine-color-secondary-6)",
			}}
		>
			{children}
		</Stack>
	);
}

function OpSummary({ op }: { op: PendingOp }) {
	if (!op.summary) {
		return (
			<Text size="xs" c="dimmed">
				{op.idempotencyKey}
			</Text>
		);
	}
	const gameLabel = op.summary.gameId
		? getGameMetadata(op.summary.gameId)?.label
		: undefined;
	return (
		<Group gap="xs" align="center" wrap="nowrap">
			{gameLabel ? <Badge variant="light">{gameLabel}</Badge> : null}
			<Text size="sm">{op.summary.title}</Text>
		</Group>
	);
}

const statusColor = (status: PendingOp["status"]) => {
	switch (status) {
		case "pending":
			return "gray";
		case "syncing":
			return "blue";
		case "synced":
			return "green";
		case "failed":
			return "red";
	}
};

/**
 * The local-queue screen. Rendered by both profile trees: signed-out visitors
 * reach it under /profile, so they can inspect and discard a queue that would
 * otherwise be invisible until they had an account.
 */
function DataSyncPanel() {
	const { data: session } = useSession();
	const queryClient = useQueryClient();

	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	const pending = usePendingOps();
	// Gated on `mounted` for the same reason the anon id below is: SSR has no
	// session, so an ungated read flips this between the server's HTML and the
	// client's first render and desyncs hydration.
	const canSync = mounted && !!session?.user?.id;

	// Scope the tab to the active game. Ops with no `summary.gameId` are
	// account-wide (profile, primary avatar) and stay visible under every game.
	const gameId = useGameId();
	const allOps = pending.data ?? [];
	const visibleOps = allOps.filter(
		(op) => op.summary?.gameId == null || op.summary.gameId === gameId,
	);

	// Deliberately unscoped by game and unscoped by the sign-in prompt's
	// preference: a claim drains everything, and this banner is the only way back
	// for someone who turned the prompt off.
	const anonUserId = mounted ? getAnonUserId() : null;
	const claimableCount = anonUserId
		? allOps.filter(
				(op) => op.anonUserId === anonUserId && op.status !== "synced",
			).length
		: 0;
	const pendingOps = visibleOps.filter((op) => op.status !== "synced");
	const syncedOps = visibleOps.filter((op) => op.status === "synced");

	const syncAll = useMutation({
		mutationFn: async () => {
			if (!pendingOps.length) return null;
			return syncOps(pendingOps);
		},
		onSuccess: (report) => {
			if (!report) return;
			const parts: string[] = [];
			if (report.applied) parts.push(`${report.applied} applied`);
			if (report.noops) parts.push(`${report.noops} already up-to-date`);
			if (report.superseded)
				parts.push(`${report.superseded} superseded by your account`);
			if (report.errors) parts.push(`${report.errors} errors`);
			const hasIssues = report.errors > 0;
			notifications.show({
				title: hasIssues ? "Sync completed with issues" : "Sync complete",
				message: parts.length ? parts.join(", ") : "Nothing to sync.",
				color: hasIssues ? "orange" : "green",
			});
		},
		onSettled: () => {
			void queryClient.invalidateQueries({ queryKey: ["sync-queue"] });
			void queryClient.invalidateQueries({ queryKey: ["data"] });
		},
	});

	const claim = useMutation({
		mutationFn: async () => {
			const userId = session?.user?.id;
			if (!userId) return;
			await runAnonDataClaim(userId, queryClient);
		},
	});

	const clear = useMutation({
		mutationFn: async () => {
			await Promise.all(syncedOps.map((op) => deleteOp(op.id)));
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["sync-queue"] }),
	});

	return (
		<Stack gap="sm">
			<Group justify="space-between">
				<Title order={3}>Data Sync</Title>
				<Group gap="xs">
					<Button
						size="xs"
						variant="default"
						onClick={() => clear.mutate()}
						disabled={clear.isPending || !syncedOps.length}
					>
						Clear synced
					</Button>
					<Button
						size="xs"
						onClick={() => syncAll.mutate()}
						disabled={!canSync || syncAll.isPending || !pendingOps.length}
					>
						{syncAll.isPending ? "Syncing…" : "Sync all"}
					</Button>
				</Group>
			</Group>
			{mounted && !canSync ? (
				<Text size="sm" c="dimmed">
					Sign in to push pending changes.
				</Text>
			) : null}
			{canSync && claimableCount > 0 ? (
				<Alert color="orange" title="Changes made while signed out">
					<Stack gap="sm" align="flex-start">
						<Text size="sm">
							{pluralChanges(claimableCount)} made while signed out are stored
							on this device but are not on your account.
						</Text>
						<Button
							size="xs"
							onClick={() => claim.mutate()}
							disabled={claim.isPending}
						>
							{claim.isPending ? "Adding…" : "Add to my account"}
						</Button>
					</Stack>
				</Alert>
			) : null}
			<PendingList
				ops={pendingOps}
				onDelete={(id) => {
					deleteOp(id).then(() =>
						queryClient.invalidateQueries({ queryKey: ["sync-queue"] }),
					);
				}}
			/>
			<SyncedList ops={syncedOps} />
		</Stack>
	);
}

export { DataSyncPanel };
