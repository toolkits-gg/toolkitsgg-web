import { consumeRateLimit } from "#/integrations/rate-limit/consume-rate-limit";

const WRITE_LIMIT_MAX = 60; // allow up to 60 writes...
const WRITE_LIMIT_WINDOW_SEC = 60; // ...per window, per user

/**
 * Consumes one write point for `userId`, throwing a 429 Response when the user
 * is over budget. Thrown Responses propagate as the HTTP result, so call this
 * right after resolving the userId in a write server function:
 *
 *   const userId = await requireUserId();
 *   await enforceUserWriteLimit(userId);
 *
 * We key by userId (never IP) because every guarded call has already passed
 * requireUserId(), and a userId can't be spoofed the way a forwarded IP header
 * can.
 */
const enforceUserWriteLimit = async (userId: string): Promise<void> => {
	const { allowed, retryAfterSec } = await consumeRateLimit({
		key: `user-write:${userId}`,
		max: WRITE_LIMIT_MAX,
		windowSec: WRITE_LIMIT_WINDOW_SEC,
	});

	if (allowed) return;

	throw new Response("Too Many Requests", {
		status: 429,
		headers: { "Retry-After": String(retryAfterSec) },
	});
};

export { enforceUserWriteLimit };
