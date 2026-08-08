import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { SYNCABLE_ENTITIES } from "#/features/sync/entities";
import type { SyncResult } from "#/features/sync/types";
import { requireUserId } from "#/features/user/require-user.server";
import { syncHandlers } from "#/games-registry/sync-handler-registry.server";
import { enforceUserWriteLimit } from "#/integrations/rate-limit/enforce-user-write-limit";
import { type Prisma, prisma } from "@/prisma";

/** Re-validates the PendingOp at the server boundary; client data is untrusted. */
const PendingOpSchema = z.object({
	id: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
	anonUserId: z.string(),
	// Enumerated rather than a free string, so an op naming an entity with no handler
	// is rejected at the boundary instead of retrying against a lookup that can't hit.
	entity: z.enum(SYNCABLE_ENTITIES),
	operation: z.enum(["create", "update", "upsert", "delete"]),
	payload: z.unknown(),
	idempotencyKey: z.string(),
	status: z.enum(["pending", "syncing", "synced", "failed"]),
	lastError: z.string().nullish(),
	serverUpdatedAt: z.string().optional(),
});

/** Wire shape for applyPendingOpServerFn. */
const ApplyPendingOpInputSchema = z.object({
	op: PendingOpSchema,
});

/** Window during which an op with the same idempotency key is considered a duplicate. */
const DEDUPE_TTL_MS = 10 * 60 * 1000;

/**
 * Deduplication cache keyed by `userId:idempotencyKey`, persisted rather than
 * held in memory. Serverless instances are ephemeral, so a retry rarely lands
 * on the instance that served the original.
 *
 * Not every handler is idempotent. For example, replaying a build duplicate
 * creates a second build, so losing the cache is a correctness problem,
 * not just a lost optimization.
 */
const rememberResult = async (key: string, result: SyncResult) => {
	const record = { key, result: result as Prisma.InputJsonValue };
	await prisma.syncIdempotency.upsert({
		where: { key },
		update: { ...record, createdAt: new Date() },
		create: record,
	});
};

/**
 * Evicts expired rows account-wide. `recallResult` only evicts keys it happens to
 * look up, so a key that is never retried would otherwise live forever.
 * Sampled rather than run on every call because draining a queue issues one request per
 * op, and this sweep is pure overhead on all but the first of them.
 */
const SWEEP_PROBABILITY = 0.02;
const sweepExpired = async () => {
	if (Math.random() >= SWEEP_PROBABILITY) return;
	await prisma.syncIdempotency
		.deleteMany({
			where: { createdAt: { lt: new Date(Date.now() - DEDUPE_TTL_MS) } },
		})
		.catch(() => {});
};

const SYNC_RESULT_STATUSES: ReadonlySet<string> = new Set([
	"applied",
	"superseded",
	"noop",
	"error",
]);

/** Prisma types the cached result only as Json, so its shape is re-checked on read. */
const isSyncResult = (value: unknown): value is SyncResult =>
	typeof value === "object" &&
	value !== null &&
	SYNC_RESULT_STATUSES.has(String((value as { status?: unknown }).status));

/**
 * Returns a cached result if within the TTL window, evicting expired entries on read.
 * An entry written by a build whose SyncResult union differed is evicted the same way,
 * so the op re-runs its handler rather than being answered with a status no caller
 * knows how to apply.
 */
const recallResult = async (key: string): Promise<SyncResult | null> => {
	const entry = await prisma.syncIdempotency.findUnique({ where: { key } });
	if (!entry) return null;
	const expired = Date.now() - entry.createdAt.getTime() > DEDUPE_TTL_MS;
	if (expired || !isSyncResult(entry.result)) {
		await prisma.syncIdempotency.delete({ where: { key } }).catch(() => {});
		return null;
	}
	return entry.result;
};

const applyPendingOpServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => ApplyPendingOpInputSchema.parse(v))
	.handler(async ({ data }) => {
		const { op } = data;
		const userId = await requireUserId();
		await enforceUserWriteLimit(userId);
		await sweepExpired();
		const dedupeKey = `${userId}:${op.idempotencyKey}`;
		const cached = await recallResult(dedupeKey);
		if (cached) return cached;

		// Total by construction: the validator above only admits a SyncableEntity, and
		// syncHandlers is keyed on that same union, so a missing handler cannot compile.
		const handler = syncHandlers[op.entity];

		try {
			const result = await handler(op, userId);
			await rememberResult(dedupeKey, result);
			return result;
		} catch (err) {
			return {
				status: "error",
				message: err instanceof Error ? err.message : String(err),
			};
		}
	});

export { applyPendingOpServerFn };
