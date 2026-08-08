import { createFileRoute } from "@tanstack/react-router";
import { AdminUsers } from "#/components/pages/admin/AdminUsers";

const Route = createFileRoute("/admin/users")({
	component: AdminUsers,
});

export { Route };
