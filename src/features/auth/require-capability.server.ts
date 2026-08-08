import type { Capability, RoleGrant } from "#/features/auth/capabilities";
import { hasCapability } from "#/features/auth/capabilities";
import { getViewerContext } from "#/features/auth/viewer-context.server";
import { requireUserId } from "#/features/user/require-user.server";
import type { GameId } from "@/prisma";

/** A banned user holds no privileges, so this returns [] for them. */
const getViewerGrants = async (): Promise<RoleGrant[]> => {
	const { grants, ban } = await getViewerContext();
	return ban ? [] : grants;
};

/**
 * Throws 403 unless the viewer holds `capability` for `gameId`. Pass
 * `gameId: "none"` for site-wide actions - only a global grant satisfies that.
 */
const requireCapability = async (
	capability: Capability,
	gameId: GameId,
): Promise<string> => {
	const userId = await requireUserId();
	const grants = await getViewerGrants();
	if (!hasCapability(grants, capability, gameId)) {
		throw new Response("Forbidden", { status: 403 });
	}
	return userId;
};

/** Non-throwing variant, for read paths that widen what a moderator can see. */
const hasViewerCapability = async (
	capability: Capability,
	gameId: GameId,
): Promise<boolean> =>
	hasCapability(await getViewerGrants(), capability, gameId);

export { getViewerGrants, hasViewerCapability, requireCapability };
