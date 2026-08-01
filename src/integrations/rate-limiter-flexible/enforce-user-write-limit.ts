import { RateLimiterMemory, type RateLimiterRes } from "rate-limiter-flexible";

/**
 * In-memory, per-process rate limiter for authenticated writes, keyed by userId.
 *
 * We key by userId (never IP) because every guarded call has already passed
 * requireUserId(), and a userId can't be spoofed the way a forwarded IP header
 * can.
 */
const writeLimiter = new RateLimiterMemory({
	points: 60, // allow up to 60 writes...
	duration: 60, // ...per rolling 60-second window, per user
});

/**
 * Consumes one point for `userId`, throwing a 429 Response when the user is over
 * budget. Thrown Responses propagate as the HTTP result,
 * so call this right after resolving the userId in a write
 * server function:
 *
 *   const userId = await requireUserId();
 *   await enforceUserWriteLimit(userId);
 */
const enforceUserWriteLimit = async (userId: string): Promise<void> => {
	try {
		await writeLimiter.consume(userId);
	} catch (rejection) {
		// consume() rejects with a RateLimiterRes when rate-limited; a real Error
		// means an unexpected internal failure, which we surface rather than mask
		// as a 429.
		if (rejection instanceof Error) throw rejection;
		const res = rejection as RateLimiterRes;
		const retryAfterSec = Math.ceil((res.msBeforeNext ?? 1000) / 1000);
		throw new Response("Too Many Requests", {
			status: 429,
			headers: { "Retry-After": String(retryAfterSec) },
		});
	}
};

export { enforceUserWriteLimit };
