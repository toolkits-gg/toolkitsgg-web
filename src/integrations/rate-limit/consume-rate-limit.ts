import { prisma } from "@/prisma";

type ConsumeArgs = {
	/** Bucket identifier. Prefix by limiter so buckets cannot collide. */
	key: string;
	/** Maximum consumptions allowed inside one window. */
	max: number;
	/** Window length in seconds. */
	windowSec: number;
};

type RateLimitResult = {
	allowed: boolean;
	/** Seconds until the window rolls over. Zero when allowed. */
	retryAfterSec: number;
};

const ALLOWED: RateLimitResult = { allowed: true, retryAfterSec: 0 };

/**
 * Bounds how many times a lost create race is retried. Each iteration only
 * loses to a concurrent writer that created the same key, so exhausting this
 * means sustained contention on one bucket - which is itself the thing being
 * rate limited.
 */
const MAX_ATTEMPTS = 3;

/** Prisma's unique-constraint violation. */
const isUniqueViolation = (error: unknown) =>
	typeof error === "object" &&
	error !== null &&
	"code" in error &&
	(error as { code?: unknown }).code === "P2002";

/**
 * Fixed-window rate limiter backed by Postgres, so counters survive cold starts
 * and are shared across concurrently running instances.
 *
 * Every branch that grants a point does so through a conditional write whose
 * WHERE clause encodes the precondition - `count < max` for an increment, an
 * expired `windowStart` for a reset, key absence for a create. The database
 * evaluates the predicate and the mutation as one statement, so two requests
 * racing on the same key cannot both observe room and both consume it.
 */
const consumeRateLimit = async ({
	key,
	max,
	windowSec,
}: ConsumeArgs): Promise<RateLimitResult> => {
	const windowMs = windowSec * 1000;

	for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
		const now = Date.now();
		const cutoff = new Date(now - windowMs);

		const incremented = await prisma.appRateLimit.updateMany({
			where: { key, count: { lt: max }, windowStart: { gt: cutoff } },
			data: { count: { increment: 1 } },
		});
		if (incremented.count > 0) return ALLOWED;

		const reset = await prisma.appRateLimit.updateMany({
			where: { key, windowStart: { lte: cutoff } },
			data: { count: 1, windowStart: new Date(now) },
		});
		if (reset.count > 0) return ALLOWED;

		// Neither write matched, so either the bucket is full inside a live
		// window or it does not exist yet. Only the former is a rejection.
		const existing = await prisma.appRateLimit.findUnique({ where: { key } });
		if (existing) {
			const elapsed = now - existing.windowStart.getTime();
			return {
				allowed: false,
				retryAfterSec: Math.max(1, Math.ceil((windowMs - elapsed) / 1000)),
			};
		}

		try {
			await prisma.appRateLimit.create({
				data: { key, count: 1, windowStart: new Date(now) },
			});
			return ALLOWED;
		} catch (error) {
			// A concurrent request created the bucket between the read and this
			// write. Anything else is a real failure and must not read as a pass.
			if (!isUniqueViolation(error)) throw error;
		}
	}

	return { allowed: false, retryAfterSec: windowSec };
};

export { consumeRateLimit };
