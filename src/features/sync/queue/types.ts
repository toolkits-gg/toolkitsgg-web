import type { SyncableEntity } from "#/features/sync/entities";
import type { GameId } from "@/prisma";

type PendingOpOperation = "create" | "update" | "upsert" | "delete";

/**
 * Human-readable snapshot of a pending op, captured at enqueue time so the
 * data-sync UI can show the user what each row actually does without parsing
 * `payload` or the idempotency key. Snapshotted (not derived at render time)
 * so an item rename or games-registry change doesn't rewrite the user's history.
 */
interface PendingOpSummary {
	/** Primary line, e.g. "Collected: Sword of Legends". */
	title: string;
	/** Optional secondary line, e.g. "Display name -> SomeUser20". */
	details?: string;
	/** Optional game association - UI renders a small game badge when set. */
	gameId?: GameId;
}

/**
 * Lifecycle of a pending op:
 * `pending` -> `syncing` -> `synced` (deleted after clearSynced)
 *                       -> `failed` (network error or no handler; can be retried)
 *
 * An op the server record has moved past is deleted outright rather than given a
 * status, since there is no reconciliation step left for the user to take.
 */
type PendingOpStatus = "pending" | "syncing" | "synced" | "failed";

/** A write operation that has been queued locally and is waiting to be synced to the server. */
interface PendingOp {
	id: string;
	createdAt: string;
	updatedAt: string;
	/** The anon user ID at the time the op was enqueued. The user may have logged in since. */
	anonUserId: string;
	/** Entity name - must match a key in the sync-handler games-registry. */
	entity: SyncableEntity;
	operation: PendingOpOperation;
	/** The original mutation input, serialized as-is. */
	payload: unknown;
	/** Stable key used by the server to deduplicate retried ops within the TTL window. */
	idempotencyKey: string;
	status: PendingOpStatus;
	/** Set when status is "failed"; null on the next status transition. */
	lastError?: string | null;
	/**
	 * Snapshot of the server record's `updatedAt` at the time the local write was created.
	 * Used by the LWW algorithm as the baseline: if the server has advanced past this value,
	 * another writer beat this op and it is discarded as superseded.
	 */
	serverUpdatedAt?: string;
	/** Display snapshot for the data-sync UI. Optional so older queued ops still render via fallback. */
	summary?: PendingOpSummary;
}

/** Optional filters for listOps, matched as an equality `where`. */
interface ListOpsFilter {
	status?: PendingOpStatus;
	entity?: SyncableEntity;
}

export type {
	ListOpsFilter,
	PendingOp,
	PendingOpOperation,
	PendingOpStatus,
	PendingOpSummary,
};
