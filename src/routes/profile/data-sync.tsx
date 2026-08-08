import { createFileRoute } from "@tanstack/react-router";
import { DataSyncPanel } from "#/features/sync/DataSyncPanel";

const Route = createFileRoute("/profile/data-sync")({
	component: DataSyncPanel,
});

export { Route };
