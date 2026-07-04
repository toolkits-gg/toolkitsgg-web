/**
 * Shared SyncHandler factory for "content-record" entities — rows with mutable
 * fields beyond mere existence (e.g. builds, profiles). The create/update/delete
 * branching and last-write-wins conflict resolution live here once, so individual
 * entities only supply how to extract their key from the op payload and how to
 * read/create/update/delete the row.
 *
 * Sibling of presence-sync-handler.ts: presence-toggle rows have no mutable fields,
 * so an upsert onto an existing row is a noop. Content records instead overwrite
 * the row from the op payload on update.
 */

import { compareTimestamps } from "#/features/sync/local-data/last-write-wins.ts";
import type {
	HasUpdatedAt,
	KeyResolution,
	SyncHandler,
} from "#/features/sync/local-data/types.ts";

export interface RecordSyncDeps<TKey> {
	/** Pulls the record's key fields from the op payload (validating/coercing as needed). */
	resolveKey: (op: { payload: unknown }) => KeyResolution<TKey>;
	/** Reads the current created-builds record (must expose `updatedAt` for LWW) or null if absent. */
	findRecord: (userId: string, key: TKey) => Promise<HasUpdatedAt | null>;
	/** Inserts the row from the op payload. Only called when no record currently exists. */
	createRecord: (userId: string, key: TKey, payload: unknown) => Promise<void>;
	/** Overwrites the existing row's mutable fields from the op payload. */
	updateRecord: (userId: string, key: TKey, payload: unknown) => Promise<void>;
	/** Deletes the row. Must be a no-op if the row is already absent. */
	deleteRecord: (userId: string, key: TKey) => Promise<void>;
}

/**
 * Builds a SyncHandler for a content-record entity.
 *
 * Delete op:
 * - record absent -> noop (desired end state already reached)
 * - record present -> LWW check (created-builds newer = conflict, unless `force`), then delete
 *
 * Create / update / upsert op:
 * - record absent -> create from payload
 * - record present -> LWW check (unless `force`): created-builds newer = conflict, equal = noop
 *   (already synced), otherwise overwrite from payload
 */
export const createRecordSyncHandler = <TKey>(
	deps: RecordSyncDeps<TKey>,
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
			if (!force) {
				const cmp = compareTimestamps(record, op);
				if (cmp === "server-wins")
					return {
						status: "conflict",
						serverRecordJson: JSON.stringify(record),
					};
				if (cmp === "equal") return { status: "noop" };
			}
			await deps.updateRecord(userId, key, op.payload);
			return { status: "applied" };
		}

		await deps.createRecord(userId, key, op.payload);
		return { status: "applied" };
	};
};
