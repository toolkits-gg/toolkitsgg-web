import type { RoleGrant } from "#/features/auth/capabilities";
import { hasCapability } from "#/features/auth/capabilities";
import {
	getViewerGrants,
	requireCapability,
} from "#/features/auth/require-capability.server";
import { logModerationAction } from "#/features/moderation/audit.server";
import { requireUserId } from "#/features/user/require-user.server";
import { allUserContentHiders } from "#/games-registry/user-content-registry.server";
import { enforceUserWriteLimit } from "#/integrations/rate-limit/enforce-user-write-limit";
import type { GameId, Role } from "@/prisma";
import { prisma } from "@/prisma";

const USER = "USER" as const;
const GLOBAL: GameId = "none";
const USER_SEARCH_LIMIT = 20;

type AdminUserRow = {
	id: string;
	username: string;
	displayName: string | null;
	bannedAt: Date | string | null;
	banReason: string | null;
	banExpiresAt: Date | string | null;
	roles: RoleGrant[];
};

/** Anyone signed in may read their own grants, so the admin nav can render. */
const listViewerGrants = async (): Promise<RoleGrant[]> => getViewerGrants();

/**
 * Username search only, and email is deliberately not in the projection: an
 * admin screen should not double as a bulk address export.
 */
const searchUsers = async (query: string): Promise<AdminUserRow[]> => {
	await requireUserId();
	const grants = await getViewerGrants();
	const allowed =
		hasCapability(grants, "role:manage", GLOBAL) ||
		hasCapability(grants, "user:ban", GLOBAL);
	if (!allowed) throw new Response("Forbidden", { status: 403 });

	const users = await prisma.user.findMany({
		where: {
			OR: [
				{ username: { contains: query.toLowerCase() } },
				{ displayUsername: { contains: query, mode: "insensitive" } },
			],
		},
		orderBy: { username: "asc" },
		take: USER_SEARCH_LIMIT,
		select: {
			id: true,
			username: true,
			displayUsername: true,
			bannedAt: true,
			banReason: true,
			banExpiresAt: true,
			UserProfile: { select: { displayName: true } },
			UserRoles: { select: { role: true, gameId: true } },
		},
	});

	return users.map((user) => ({
		id: user.id,
		username: user.displayUsername ?? user.username,
		displayName: user.UserProfile?.displayName ?? null,
		bannedAt: user.bannedAt,
		banReason: user.banReason,
		banExpiresAt: user.banExpiresAt,
		roles: user.UserRoles,
	}));
};

const assertGrantShape = (role: Role, gameId: GameId) => {
	// SUPERADMIN is the site-wide role that hands out every other one; scoping it
	// to a single game would be a contradiction.
	if (role === "SUPERADMIN" && gameId !== GLOBAL) {
		throw new Error("SUPERADMIN can only be granted globally");
	}
	if (gameId !== GLOBAL && role !== "MODERATOR" && role !== "ADMIN") {
		throw new Error(`${role} cannot be scoped to a game`);
	}
};

const grantRole = async (userId: string, role: Role, gameId: GameId) => {
	const actorId = await requireCapability("role:manage", GLOBAL);
	await enforceUserWriteLimit(actorId);
	assertGrantShape(role, gameId);

	await prisma.$transaction(async (tx) => {
		await tx.userRole.upsert({
			where: { userId_role_gameId: { userId, role, gameId } },
			update: {},
			create: { userId, role, gameId, grantedById: actorId },
		});
		await logModerationAction({
			tx,
			actorId,
			gameId,
			action: "ROLE_GRANT",
			targetType: USER,
			targetId: userId,
			newValue: role,
		});
	});

	return { ok: true as const };
};

const revokeRole = async (userId: string, role: Role, gameId: GameId) => {
	const actorId = await requireCapability("role:manage", GLOBAL);
	await enforceUserWriteLimit(actorId);

	// Without this a super admin can lock themselves - and possibly everyone -
	// out of role management entirely.
	if (userId === actorId && role === "SUPERADMIN") {
		throw new Error("You cannot revoke your own SUPERADMIN role");
	}

	await prisma.$transaction(async (tx) => {
		await tx.userRole.deleteMany({ where: { userId, role, gameId } });
		await logModerationAction({
			tx,
			actorId,
			gameId,
			action: "ROLE_REVOKE",
			targetType: USER,
			targetId: userId,
			previousValue: role,
		});
	});

	return { ok: true as const };
};

/**
 * Only a global grant satisfies a `user:ban` check at `gameId: "none"`, which
 * is what keeps a single game's admin from locking someone out of the site.
 */
const banUser = async (args: {
	userId: string;
	reason: string;
	expiresAt?: string | null;
	hideContent?: boolean;
}) => {
	const actorId = await requireCapability("user:ban", GLOBAL);
	await enforceUserWriteLimit(actorId);

	if (args.userId === actorId) throw new Error("You cannot ban yourself");

	const target = await prisma.user.findUnique({
		where: { id: args.userId },
		select: { UserRoles: { select: { role: true, gameId: true } } },
	});
	if (!target) throw new Error("User not found");

	// Banning a fellow staff member is a super admin's call, not a peer's.
	const targetIsStaff = target.UserRoles.some(
		(grant) => grant.gameId === GLOBAL,
	);
	if (targetIsStaff) {
		const actorGrants = await getViewerGrants();
		const actorIsSuperAdmin = actorGrants.some(
			(grant) => grant.role === "SUPERADMIN",
		);
		if (!actorIsSuperAdmin) {
			throw new Error("Only a SUPERADMIN can ban a user holding a global role");
		}
	}

	const expiresAt = args.expiresAt ? new Date(args.expiresAt) : null;

	await prisma.$transaction(async (tx) => {
		await tx.user.update({
			where: { id: args.userId },
			data: {
				bannedAt: new Date(),
				banReason: args.reason,
				banExpiresAt: expiresAt,
				bannedById: actorId,
			},
		});

		// The session cookie is cached for five minutes, so revoking the sessions
		// is what makes the ban take effect now rather than eventually.
		await tx.session.deleteMany({ where: { userId: args.userId } });

		if (args.hideContent) {
			for (const hide of allUserContentHiders()) {
				await hide(tx, args.userId, actorId);
			}
		}

		await logModerationAction({
			tx,
			actorId,
			gameId: GLOBAL,
			action: "USER_BAN",
			targetType: USER,
			targetId: args.userId,
			newValue: expiresAt ? expiresAt.toISOString() : "permanent",
			reason: args.hideContent
				? `${args.reason} (content hidden)`
				: args.reason,
		});
	});

	return { ok: true as const };
};

const unbanUser = async (userId: string, reason?: string) => {
	const actorId = await requireCapability("user:ban", GLOBAL);
	await enforceUserWriteLimit(actorId);

	await prisma.$transaction(async (tx) => {
		const before = await tx.user.findUnique({
			where: { id: userId },
			select: { banReason: true },
		});
		await tx.user.update({
			where: { id: userId },
			data: {
				bannedAt: null,
				banReason: null,
				banExpiresAt: null,
				bannedById: null,
			},
		});
		await logModerationAction({
			tx,
			actorId,
			gameId: GLOBAL,
			action: "USER_UNBAN",
			targetType: USER,
			targetId: userId,
			previousValue: before?.banReason ?? null,
			reason,
		});
	});

	return { ok: true as const };
};

export type { AdminUserRow };
export {
	banUser,
	grantRole,
	listViewerGrants,
	revokeRole,
	searchUsers,
	unbanUser,
};
