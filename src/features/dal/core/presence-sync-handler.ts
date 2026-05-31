// Shared SyncHandler factory for "presence-toggle" entities — rows that either
// exist or don't, with no mutable fields beyond their existence (e.g. collected
// items, favorited games). The delete/upsert branching and last-write-wins
// conflict resolution live here once, so individual entities only supply how to
// extract their key from the op payload and how to read/create/delete the row.

import type { SyncHandler } from "#/features/dal/core/types.ts";
import {
	compareTimestamps,
	type HasUpdatedAt,
} from "#/features/dal/queue/last-write-wins.ts";
import type { PendingOp } from "#/features/dal/queue/types.ts";

/** Result of pulling a record key out of an op payload. */
type KeyResolution<TKey> =
	| { ok: true; key: TKey }
	| { ok: false; message: string };

interface PresenceToggleDeps<TKey> {
	/** Pulls the record's key fields from the op payload (validating/coercing as needed). */
	resolveKey: (op: PendingOp) => KeyResolution<TKey>;
	/** Reads the current server record (must expose `updatedAt` for LWW) or null if absent. */
	findRecord: (userId: string, key: TKey) => Promise<HasUpdatedAt | null>;
	/** Deletes the row. Must be a no-op if the row is already absent. */
	deleteRecord: (userId: string, key: TKey) => Promise<void>;
	/** Creates the row. Only called when no record currently exists. */
	createRecord: (userId: string, key: TKey) => Promise<void>;
}

/**
 * Builds a SyncHandler for a presence-toggle entity.
 *
 * Delete op:
 * - record absent -> noop (desired end state already reached)
 * - record present -> LWW check (server newer = conflict, unless `force`), then delete
 *
 * Upsert op:
 * - record present -> LWW check (server newer = conflict, unless `force`); otherwise
 *   noop, since the row has no mutable fields to overwrite
 * - record absent -> create
 */
const createPresenceToggleSyncHandler = <TKey>(
	deps: PresenceToggleDeps<TKey>,
): SyncHandler => {
	return async (op, userId, options) => {
		const resolved = deps.resolveKey(op);
		if (!resolved.ok) return { status: "error", message: resolved.message };
		const { key } = resolved;

		const record = await deps.findRecord(userId, key);
		const force = options?.force ?? false;

		if (op.operation === "delete") {
			if (!record) return { status: "noop" };
			if (!force) {
				const cmp = compareTimestamps(record, op);
				if (cmp === "server-wins")
					return {
						status: "conflict",
						serverRecordJson: JSON.stringify(record),
					};
			}
			await deps.deleteRecord(userId, key);
			return { status: "applied" };
		}

		if (record) {
			if (force) return { status: "noop" };
			const cmp = compareTimestamps(record, op);
			if (cmp === "server-wins")
				return { status: "conflict", serverRecordJson: JSON.stringify(record) };
			return { status: "noop" };
		}

		await deps.createRecord(userId, key);
		return { status: "applied" };
	};
};

export type { PresenceToggleDeps };
export { createPresenceToggleSyncHandler };
