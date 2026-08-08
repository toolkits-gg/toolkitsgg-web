// `Role` and `GameId` are type-only imports, so this module never
// pulls `@/prisma` into the browser bundle. ROLE_VALUES mirrors the Prisma
// `Role` enum the same way BUILD_VISIBILITY_VALUES mirrors `BuildVisibility`.

import type { GameId, Role } from "@/prisma";

const ROLE_VALUES = ["MODERATOR", "ADMIN", "SUPERADMIN"] as const;

const CAPABILITY_VALUES = [
	"build:moderate", // Resolve review items, edit a build in place, clear its video or description, force it private.
	"build:lock", // LOCKED: takes the build out of circulation and blocks further owner edits.
	"build:delete",
	"feed:manage",
	"user:ban",
	"role:manage",
	"audit:read",
] as const;

type Capability = (typeof CAPABILITY_VALUES)[number];

const ROLE_CAPABILITIES = {
	MODERATOR: ["build:moderate", "audit:read"],
	ADMIN: [
		"build:moderate",
		"build:lock",
		"build:delete",
		"feed:manage",
		"user:ban",
		"audit:read",
	],
	SUPERADMIN: [
		"build:moderate",
		"build:lock",
		"build:delete",
		"feed:manage",
		"user:ban",
		"role:manage",
		"audit:read",
	],
} as const satisfies Record<Role, readonly Capability[]>;

type RoleGrant = { role: Role; gameId: GameId };

/** A grant scoped to `none` is global, so it covers every game. */
const grantCoversGame = (grant: RoleGrant, gameId: GameId): boolean =>
	grant.gameId === "none" || grant.gameId === gameId;

const roleHasCapability = (role: Role, capability: Capability): boolean =>
	(ROLE_CAPABILITIES[role] as readonly Capability[]).includes(capability);

/**
 * Passing `gameId: "none"` asks about the site-wide context, which only a
 * global grant covers. That is what keeps `user:ban` out of the hands of a
 * single game's admin.
 */
const hasCapability = (
	grants: readonly RoleGrant[],
	capability: Capability,
	gameId: GameId,
): boolean => {
	const applicableGrants = grants.filter((grant) =>
		grantCoversGame(grant, gameId),
	);

	return applicableGrants.some((grant) =>
		roleHasCapability(grant.role, capability),
	);
};

const capabilitiesForGrants = (
	grants: readonly RoleGrant[],
	gameId: GameId,
): Capability[] =>
	CAPABILITY_VALUES.filter((capability) =>
		hasCapability(grants, capability, gameId),
	);

export type { Capability, RoleGrant };
export { capabilitiesForGrants, hasCapability, ROLE_VALUES };
