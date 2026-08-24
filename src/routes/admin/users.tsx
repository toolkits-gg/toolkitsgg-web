import { createFileRoute } from "@tanstack/react-router";
import { AdminUsers } from "#/documents/admin/AdminUsers";

const Route = createFileRoute("/admin/users")({
	component: AdminUsers,
});

export { Route };
