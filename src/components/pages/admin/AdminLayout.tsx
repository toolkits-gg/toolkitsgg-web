import { Alert, Badge, Box, Group, Stack, Title } from "@mantine/core";
import { getRouteApi, Link, Outlet, useLocation } from "@tanstack/react-router";
import type { Capability } from "#/features/auth/capabilities";
import { hasCapability } from "#/features/auth/capabilities";
import { useGameId } from "#/features/game/use-game-id";
import type { GameId } from "@/prisma";
import classes from "./AdminLayout.module.css";

type NavItem = { to: string; label: string; visible: boolean };

const routeApi = getRouteApi("/admin");

/**
 * Gates the admin section on the viewer holding any role. Grants come from the
 * route loader rather than useViewerGrants so the gate resolves before render;
 * this only decides what the UI offers, and every privileged server fn
 * re-checks independently.
 */
const AdminLayout = () => {
	const { grants } = routeApi.useLoaderData();
	const gameId = useGameId();
	const location = useLocation();

	const can = (capability: Capability, forGameId: GameId) =>
		hasCapability(grants, capability, forGameId);

	if (grants.length === 0) {
		return (
			<Box p="md">
				<Alert color="red" title="Not authorized">
					You do not have a moderator or admin role.
				</Alert>
			</Box>
		);
	}

	const items: NavItem[] = [
		{ to: "/admin", label: "Overview", visible: true },
		{
			to: "/admin/queue",
			label: "Review queue",
			visible: can("build:moderate", gameId),
		},
		{
			to: "/admin/users",
			label: "Users",
			visible: can("role:manage", "none") || can("user:ban", "none"),
		},
		{
			to: "/admin/audit",
			label: "Audit log",
			visible: can("audit:read", gameId),
		},
	];

	return (
		<Stack gap="md" p="md">
			<Group justify="space-between">
				<Title order={2}>Moderation</Title>
				<Badge variant="light">{gameId}</Badge>
			</Group>

			<Group gap="xs">
				{items
					.filter((item) => item.visible)
					.map((item) => (
						<Link
							key={item.to}
							to={item.to}
							className={classes.navLink}
							data-active={location.pathname === item.to || undefined}
						>
							{item.label}
						</Link>
					))}
			</Group>

			<Outlet />
		</Stack>
	);
};

export { AdminLayout };
