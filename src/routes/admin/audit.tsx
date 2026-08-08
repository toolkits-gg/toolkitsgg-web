import { Alert } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { AuditLog } from "#/components/pages/admin/AuditLog";
import { useGameId } from "#/features/game/use-game-id";
import { getGameBuilds } from "#/games-registry/builds-registry";

const AdminAudit = () => {
	const gameId = useGameId();
	const builds = getGameBuilds(gameId);
	if (!builds) {
		return <Alert color="yellow">{gameId} has no moderation history.</Alert>;
	}
	return <AuditLog builds={builds} />;
};

const Route = createFileRoute("/admin/audit")({
	component: AdminAudit,
});

export { Route };
