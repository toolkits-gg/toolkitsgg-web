import { getRequest } from "@tanstack/react-start/server";
import type { RoleGrant } from "#/features/auth/capabilities";
import { auth } from "#/integrations/better-auth/auth";
import { prisma } from "@/prisma";

type ActiveBan = { reason: string | null; expiresAt: Date | null };

type ViewerContext = {
	userId: string | null;
	grants: RoleGrant[];
	ban: ActiveBan | null;
};

const GUEST: ViewerContext = { userId: null, grants: [], ban: null };

/**
 * Roles and ban state are read from the database rather than off the session,
 * because better-auth is configured with a 5-minute session cookie cache: a
 * revoked role or a fresh ban would otherwise keep working for minutes.
 *
 * The cost is one indexed lookup per authenticated request, which the
 * per-request memoization below collapses no matter how many capability checks
 * a single server function makes.
 */
const loadViewerContext = async (request: Request): Promise<ViewerContext> => {
	const session = await auth.api.getSession({ headers: request.headers });
	const userId = session?.user?.id;
	if (!userId) return GUEST;

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			bannedAt: true,
			banReason: true,
			banExpiresAt: true,
			UserRoles: { select: { role: true, gameId: true } },
		},
	});
	if (!user) return GUEST;

	const banActive =
		user.bannedAt !== null &&
		(user.banExpiresAt === null || user.banExpiresAt > new Date());

	return {
		userId,
		grants: user.UserRoles,
		ban: banActive
			? { reason: user.banReason, expiresAt: user.banExpiresAt }
			: null,
	};
};

// Keyed on the request object itself, so the entry dies with the request.
const contextByRequest = new WeakMap<Request, Promise<ViewerContext>>();

/** Caches the promise, not the result, so concurrent callers share one round trip. */
const getViewerContext = (): Promise<ViewerContext> => {
	const request = getRequest();
	const cached = contextByRequest.get(request);
	if (cached) return cached;

	const pending = loadViewerContext(request);
	contextByRequest.set(request, pending);
	return pending;
};

const banMessage = (ban: ActiveBan): string => {
	const until = ban.expiresAt
		? ` until ${ban.expiresAt.toISOString()}`
		: " permanently";
	return `Account suspended${until}.${ban.reason ? ` Reason: ${ban.reason}` : ""}`;
};

export type { ActiveBan, ViewerContext };
export { banMessage, getViewerContext };
