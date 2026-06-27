// TanStack Start server function that applies a single pending op with idempotency.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { syncHandlers } from "#/features/sync/handler-registry.ts";
import type { SyncResult } from "#/features/sync/types.ts";
import { requireUserId } from "#/features/user/require-user.server.ts";

/** Re-validates the PendingOp at the server boundary; client data is untrusted. */
const PendingOpSchema = z.object({
	id: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
	anonUserId: z.string(),
	entity: z.string(),
	operation: z.enum(["create", "update", "upsert", "delete"]),
	payload: z.unknown(),
	idempotencyKey: z.string(),
	status: z.enum(["pending", "syncing", "synced", "failed", "conflict"]),
	lastError: z.string().optional(),
	serverUpdatedAt: z.string().optional(),
});

/**
 * Wire shape for applyPendingOpServerFn. `force: true` requests that the
 * handler skip its LWW check; handlers never trust a `force` field embedded
 * inside `payload`, so it lives at the wrapper level.
 */
const ApplyPendingOpInputSchema = z.object({
	op: PendingOpSchema,
	force: z.boolean().optional(),
});

/** Window during which an op with the same idempotency key is considered a duplicate. */
const DEDUPE_TTL_MS = 10 * 60 * 1000;

/**
 * In-memory deduplication cache keyed by `userId:idempotencyKey`.
 * Per-process only — cleared on server restart. Deduplication is a best-effort
 * optimization (prevents double-writes on retry storms), not a correctness guarantee.
 */
const seen = new Map<string, { result: SyncResult; seenAt: number }>();

/** Stores a sync result for future deduplication lookups. */
const rememberResult = (key: string, result: SyncResult) => {
	seen.set(key, { result, seenAt: Date.now() });
};

/** Returns a cached result if within the TTL window, evicting expired entries on read. */
const recallResult = (key: string): SyncResult | null => {
	const entry = seen.get(key);
	if (!entry) return null;
	if (Date.now() - entry.seenAt > DEDUPE_TTL_MS) {
		seen.delete(key);
		return null;
	}
	return entry.result;
};

const applyPendingOpServerFn = createServerFn({ method: "POST" })
	.inputValidator((v: unknown) => ApplyPendingOpInputSchema.parse(v))
	.handler(async ({ data }) => {
		const { op, force } = data;
		// requireUserId() runs first because userId is part of the deduplication key.
		const userId = await requireUserId();
		// Force-syncs must skip the dedupe cache: the prior cached result is the
		// conflict the user just chose to override.
		const dedupeKey = `${userId}:${op.idempotencyKey}`;
		if (!force) {
			const cached = recallResult(dedupeKey);
			if (cached) return cached;
		}

		const handler = syncHandlers[op.entity];
		if (!handler) {
			return { status: "error", message: `no sync handler for ${op.entity}` };
		}

		try {
			const result = await handler(op, userId, { force });
			rememberResult(dedupeKey, result);
			return result;
		} catch (err) {
			return {
				status: "error",
				message: err instanceof Error ? err.message : String(err),
			};
		}
	});

export { applyPendingOpServerFn };
