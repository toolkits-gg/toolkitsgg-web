import {
	Badge,
	Button,
	Code,
	Divider,
	Group,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { useNetwork } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
	buildTabHead,
	loadProfileTabData,
} from "#/features/auth/core/profile-tab-head";
import { clearSynced, deleteOp } from "#/features/dal/queue/pending-ops";
import { forceSyncOp, syncOps } from "#/features/dal/queue/sync-runner";
import type { PendingOp } from "#/features/dal/queue/types";
import { usePendingOps } from "#/features/dal/queue/use-pending-ops";
import { getGameMetadata } from "#/features/game/registry/game-registry";
import { useSession } from "#/integrations/better-auth/auth-client";

const PendingList = ({
	ops,
	onDelete,
	onKeepMine,
	onAcceptServer,
	canResolve,
	resolvingOpId,
}: {
	ops: PendingOp[];
	onDelete: (id: string) => void;
	onKeepMine: (op: PendingOp) => void;
	onAcceptServer: (id: string) => void;
	canResolve: boolean;
	resolvingOpId: string | null;
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
				<Stack key={op.id} gap={4}>
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
					{op.status === "conflict" && op.conflictInfo ? (
						<ConflictPanel
							op={op}
							onKeepMine={onKeepMine}
							onAcceptServer={onAcceptServer}
							canResolve={canResolve}
							busy={resolvingOpId === op.id}
						/>
					) : null}
				</Stack>
			))}
		</Stack>
	);
};

function ConflictPanel({
	op,
	onKeepMine,
	onAcceptServer,
	canResolve,
	busy,
}: {
	op: PendingOp;
	onKeepMine: (op: PendingOp) => void;
	onAcceptServer: (id: string) => void;
	canResolve: boolean;
	busy: boolean;
}) {
	const json = formatJson(op.conflictInfo?.serverRecordJson);
	return (
		<Stack
			gap="xs"
			p="xs"
			style={{
				borderLeft: "2px solid var(--mantine-color-orange-6)",
				marginLeft: 4,
			}}
		>
			<Text size="xs" c="dimmed">
				Server has a newer record for this change. Pick one:
			</Text>
			{json ? (
				<Code block style={{ fontSize: 11, maxHeight: 160, overflow: "auto" }}>
					{json}
				</Code>
			) : null}
			<Group gap="xs">
				<Button
					size="xs"
					onClick={() => onKeepMine(op)}
					disabled={!canResolve || busy}
				>
					Keep mine
				</Button>
				<Button
					size="xs"
					variant="default"
					onClick={() => onAcceptServer(op.id)}
					disabled={busy}
				>
					Accept server
				</Button>
			</Group>
		</Stack>
	);
}

const formatJson = (raw: string | undefined): string | null => {
	if (!raw) return null;
	try {
		return JSON.stringify(JSON.parse(raw), null, 2);
	} catch {
		return raw;
	}
};

function SyncedList({ ops }: { ops: PendingOp[] }) {
	if (!ops.length) return null;

	return (
		<>
			<Divider label="Completed" labelPosition="left" />
			<Stack gap="xs">
				{ops.map((op) => (
					<Stack key={op.id} gap={2}>
						<Group gap="xs" wrap="nowrap" align="center">
							<Badge>{op.entity}</Badge>
							<Badge variant="light">{op.operation}</Badge>
							<Badge color="green" variant="outline">
								synced
							</Badge>
						</Group>
						<OpSummary op={op} />
					</Stack>
				))}
			</Stack>
		</>
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
		<>
			<Group gap="xs" align="center" wrap="nowrap">
				{gameLabel ? <Badge variant="light">{gameLabel}</Badge> : null}
				<Text size="sm">{op.summary.title}</Text>
			</Group>
			{op.summary.details ? (
				<Text size="xs" c="dimmed">
					{op.summary.details}
				</Text>
			) : null}
		</>
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
		case "conflict":
			return "orange";
		case "failed":
			return "red";
	}
};

function DataSync() {
	const { data: session } = useSession();
	const { online } = useNetwork();
	const queryClient = useQueryClient();

	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	const pending = usePendingOps();
	const canSync = !!session?.user?.id && online;

	const syncAll = useMutation({
		mutationFn: async () => {
			if (!pending.data) return null;
			return syncOps(pending.data);
		},
		onSuccess: (report) => {
			if (!report) return;
			const parts: string[] = [];
			if (report.applied) parts.push(`${report.applied} applied`);
			if (report.noops) parts.push(`${report.noops} already up-to-date`);
			if (report.conflicts) parts.push(`${report.conflicts} conflicts`);
			if (report.errors) parts.push(`${report.errors} errors`);
			const hasIssues = report.conflicts > 0 || report.errors > 0;
			notifications.show({
				title: hasIssues ? "Sync completed with issues" : "Sync complete",
				message: parts.length ? parts.join(", ") : "Nothing to sync.",
				color: hasIssues ? "orange" : "green",
			});
		},
		onSettled: () => {
			void queryClient.invalidateQueries({ queryKey: ["dal-queue"] });
			void queryClient.invalidateQueries({ queryKey: ["dal"] });
		},
	});

	const clear = useMutation({
		mutationFn: () => clearSynced(),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dal-queue"] }),
	});

	const keepMine = useMutation({
		mutationFn: async (op: PendingOp) => {
			return forceSyncOp(op);
		},
		onSuccess: (result) => {
			const ok = result.status === "applied" || result.status === "noop";
			notifications.show({
				title: ok ? "Local change kept" : "Could not keep local change",
				message:
					result.status === "error"
						? result.message
						: result.status === "conflict"
							? "Server still reports a conflict."
							: "",
				color: ok ? "green" : "orange",
			});
		},
		onSettled: () => {
			void queryClient.invalidateQueries({ queryKey: ["dal-queue"] });
			void queryClient.invalidateQueries({ queryKey: ["dal"] });
		},
	});

	const acceptServer = useMutation({
		mutationFn: async (opId: string) => deleteOp(opId),
		onSuccess: () => {
			notifications.show({
				title: "Server change accepted",
				message: "Your local change was discarded.",
				color: "blue",
			});
		},
		onSettled: () => {
			void queryClient.invalidateQueries({ queryKey: ["dal-queue"] });
			void queryClient.invalidateQueries({ queryKey: ["dal"] });
		},
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
						disabled={clear.isPending}
					>
						Clear synced
					</Button>
					<Button
						size="xs"
						onClick={() => syncAll.mutate()}
						disabled={!canSync || syncAll.isPending || !pending.data?.length}
					>
						{syncAll.isPending ? "Syncing…" : "Sync all"}
					</Button>
				</Group>
			</Group>
			{mounted && !canSync ? (
				<Text size="sm" c="dimmed">
					Sign in and come online to push pending changes.
				</Text>
			) : null}
			<PendingList
				ops={(pending.data ?? []).filter((op) => op.status !== "synced")}
				onDelete={(id) => {
					deleteOp(id).then(() =>
						queryClient.invalidateQueries({ queryKey: ["dal-queue"] }),
					);
				}}
				onKeepMine={(op) => keepMine.mutate(op)}
				onAcceptServer={(id) => acceptServer.mutate(id)}
				canResolve={canSync}
				resolvingOpId={
					keepMine.isPending
						? (keepMine.variables?.id ?? null)
						: acceptServer.isPending
							? (acceptServer.variables ?? null)
							: null
				}
			/>
			<SyncedList
				ops={(pending.data ?? []).filter((op) => op.status === "synced")}
			/>
		</Stack>
	);
}

const Route = createFileRoute("/account/profile/$userId/data-sync")({
	loader: async ({ params, context }) =>
		loadProfileTabData(params.userId, context.queryClient),
	head: ({ loaderData }) => ({
		meta: buildTabHead(
			loaderData?.displayName ?? "Toolkits.gg User",
			"Data Sync",
		),
	}),
	component: DataSync,
});

export { Route };
