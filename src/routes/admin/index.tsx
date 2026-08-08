import { createFileRoute } from "@tanstack/react-router";
import { AdminHome } from "#/components/pages/admin/AdminHome";

const Route = createFileRoute("/admin/")({
	component: AdminHome,
});

export { Route };
