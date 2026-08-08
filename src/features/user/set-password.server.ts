import { getRequest } from "@tanstack/react-start/server";
import { requireUserId } from "#/features/user/require-user.server";
import { auth } from "#/integrations/better-auth/auth";
import { enforceUserWriteLimit } from "#/integrations/rate-limit/enforce-user-write-limit";

/**
 * better-auth marks `/set-password` server-only, so it has no authClient
 * counterpart and has to be reached through `auth.api` behind a server function.
 * It is a no-op for an account that already has a password, which is why the
 * caller has to be the one to check.
 */
const setPassword = async (newPassword: string) => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	await auth.api.setPassword({
		body: { newPassword },
		headers: getRequest().headers,
	});
	return { ok: true as const };
};

export { setPassword };
