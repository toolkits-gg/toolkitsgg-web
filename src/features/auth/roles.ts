// Roles and bans: validators plus the TanStack server-fn wrappers. Never
// references `@/prisma` at module scope so client components can import it.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ROLE_VALUES, type RoleGrant } from "#/features/auth/capabilities";
import type { AdminUserRow } from "#/features/auth/roles.server";
import {
	banUser,
	grantRole,
	listViewerGrants,
	revokeRole,
	searchUsers,
	unbanUser,
} from "#/features/auth/roles.server";
import { REGISTERED_GAME_IDS } from "#/games-registry/public-registry";

const GAME_ID_VALUES = ["none", ...REGISTERED_GAME_IDS] as const;

const GrantInput = z.object({
	userId: z.string().min(1),
	role: z.enum(ROLE_VALUES),
	gameId: z.enum(GAME_ID_VALUES),
});
const SearchInput = z.object({ query: z.string().min(1).max(64) });
const BanInput = z.object({
	userId: z.string().min(1),
	reason: z.string().min(1).max(2000),
	expiresAt: z.string().nullable().optional(),
	hideContent: z.boolean().optional(),
});
const UnbanInput = z.object({
	userId: z.string().min(1),
	reason: z.string().max(2000).optional(),
});

const listViewerGrantsServerFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<RoleGrant[]> => listViewerGrants(),
);

const searchUsersServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => SearchInput.parse(v))
	.handler(
		async ({ data }): Promise<AdminUserRow[]> => searchUsers(data.query),
	);

const grantRoleServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => GrantInput.parse(v))
	.handler(async ({ data }) => grantRole(data.userId, data.role, data.gameId));

const revokeRoleServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => GrantInput.parse(v))
	.handler(async ({ data }) => revokeRole(data.userId, data.role, data.gameId));

const banUserServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => BanInput.parse(v))
	.handler(async ({ data }) => banUser(data));

const unbanUserServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => UnbanInput.parse(v))
	.handler(async ({ data }) => unbanUser(data.userId, data.reason));

export {
	banUserServerFn,
	GAME_ID_VALUES,
	grantRoleServerFn,
	listViewerGrantsServerFn,
	revokeRoleServerFn,
	searchUsersServerFn,
	unbanUserServerFn,
};
