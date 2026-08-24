import { createFileRoute } from "@tanstack/react-router";
import { AdminHomeDocument } from "#/documents/admin/AdminHomeDocument.tsx";

const Route = createFileRoute("/admin/")({
	component: AdminHomeDocument,
});

export { Route };
