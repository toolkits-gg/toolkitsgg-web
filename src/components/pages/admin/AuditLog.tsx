import {
	Alert,
	Badge,
	Center,
	Loader,
	Stack,
	Table,
	Text,
	TextInput,
} from "@mantine/core";
import { useState } from "react";
import type { GameBuildsConfig } from "#/features/game/types";

const DESTRUCTIVE_ACTIONS = new Set([
	"DELETE",
	"LOCK",
	"SET_PRIVATE",
	"USER_BAN",
	"ROLE_REVOKE",
]);

/** Append-only history. Nothing here can be edited or removed from the UI. */
const AuditLog = ({ builds }: { builds: GameBuildsConfig }) => {
	const [targetId, setTargetId] = useState("");
	const moderation = builds.data.moderation;
	const log = moderation?.useAuditLog({ targetId: targetId || undefined });

	if (!moderation) {
		return <Alert color="yellow">This game has no moderation tools.</Alert>;
	}

	const rows = log?.data ?? [];

	return (
		<Stack gap="md">
			<TextInput
				label="Filter by target id"
				description="A build, collection, or user id. Leave blank for everything."
				value={targetId}
				onChange={(event) => setTargetId(event.currentTarget.value.trim())}
			/>

			{log?.isPending ? (
				<Center p="xl">
					<Loader />
				</Center>
			) : rows.length === 0 ? (
				<Text c="dimmed">No entries.</Text>
			) : (
				<Table.ScrollContainer minWidth={800}>
					<Table striped highlightOnHover>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>When</Table.Th>
								<Table.Th>Actor</Table.Th>
								<Table.Th>Action</Table.Th>
								<Table.Th>Target</Table.Th>
								<Table.Th>Change</Table.Th>
								<Table.Th>Reason</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{rows.map((row) => (
								<Table.Tr key={row.id}>
									<Table.Td>
										<Text size="xs" c="dimmed">
											{new Date(row.createdAt).toLocaleString()}
										</Text>
									</Table.Td>
									<Table.Td>{row.actor?.username ?? "unknown"}</Table.Td>
									<Table.Td>
										<Badge
											size="sm"
											variant="light"
											color={
												DESTRUCTIVE_ACTIONS.has(row.action) ? "red" : "gray"
											}
										>
											{row.action}
										</Badge>
									</Table.Td>
									<Table.Td>
										<Text size="xs" ff="monospace">
											{row.targetType}:{row.targetId}
										</Text>
									</Table.Td>
									<Table.Td>
										<Text size="xs" c="dimmed" lineClamp={2}>
											{row.previousValue ?? "-"} → {row.newValue ?? "-"}
										</Text>
									</Table.Td>
									<Table.Td>
										<Text size="xs" lineClamp={2}>
											{row.reason ?? ""}
										</Text>
									</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				</Table.ScrollContainer>
			)}
		</Stack>
	);
};

export { AuditLog };
