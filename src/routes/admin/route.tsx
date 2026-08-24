import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "#/documents/admin/AdminLayout";
import { listViewerGrantsServerFn } from "#/features/auth/roles";

const Route = createFileRoute("/admin")({
	// Resolved on the server so the gate renders identically on both sides. The
	// useSession() store behind useViewerGrants fetches on its first subscriber,
	// which on a full page load beats this lazy route chunk to the punch and
	// leaves the client's first render disagreeing with the SSR'd HTML.
	loader: async () => ({ grants: await listViewerGrantsServerFn() }),
	component: AdminLayout,
});

export { Route };
