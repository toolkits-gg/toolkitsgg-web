import type { GameId } from "@/prisma";

type PendingOpOperation = "create" | "update" | "upsert" | "delete";

/**
 * Human-readable snapshot of a pending op, captured at enqueue time so the
 * data-sync UI can show the user what each row actually does without parsing
 * `payload` or the idempotency key. Snapshotted (not derived at render time)
 * so an item rename or registry change doesn't rewrite the user's history.
 */
interface PendingOpSummary {
	/** Primary line, e.g. "Collected: Sword of Legends". */
	title: string;
	/** Optional secondary line, e.g. "Display name -> SomeUser20". */
	details?: string;
	/** Optional game association — UI renders a small game badge when set. */
	gameId?: GameId;
}

/**
 * Snapshot of the conflicting server record, attached to a PendingOp when its
 * sync result was `conflict`. Lets the data-sync UI show the user what the
 * server has so they can choose between force-pushing local or accepting server.
 */
interface PendingOpConflictInfo {
	/** Raw JSON of the server record returned by the sync handler. */
	serverRecordJson: string;
	/** ISO timestamp the conflict was first observed. */
	detectedAt: string;
}

/**
 * Lifecycle of a pending op:
 * `pending` -> `syncing` -> `synced` (deleted after clearSynced)
 *                       -> `conflict` (server record is newer; user must reconcile)
 *                       -> `failed` (network error or no handler; can be retried)
 */
type PendingOpStatus = "pending" | "syncing" | "synced" | "failed" | "conflict";

/** A write operation that has been queued locally and is waiting to be synced to the server. */
interface PendingOp {
	id: string;
	createdAt: string;
	updatedAt: string;
	/** The anon user ID at the time the op was enqueued. The user may have logged in since. */
	anonUserId: string;
	/** Entity name — must match a key in the sync-handler registry. */
	entity: string;
	operation: PendingOpOperation;
	/** The original mutation input, serialized as-is. */
	payload: unknown;
	/** Stable key used by the server to deduplicate retried ops within the TTL window. */
	idempotencyKey: string;
	status: PendingOpStatus;
	/** Set when status is "failed"; cleared on the next status transition. */
	lastError?: string;
	/**
	 * Snapshot of the server record's `updatedAt` at the time the local write was created.
	 * Used by the LWW algorithm as the baseline: if the server has advanced past this value,
	 * another writer beat this op and the result is a conflict.
	 */
	serverUpdatedAt?: string;
	/** Display snapshot for the data-sync UI. Optional so older queued ops still render via fallback. */
	summary?: PendingOpSummary;
	/** Set when status is "conflict"; cleared on the next status transition. */
	conflictInfo?: PendingOpConflictInfo;
}

/** Optional filters for listOps. */
interface ListOpsFilter {
	status?: PendingOpStatus;
	entity?: string;
}

export type {
	ListOpsFilter,
	PendingOp,
	PendingOpConflictInfo,
	PendingOpOperation,
	PendingOpStatus,
	PendingOpSummary,
};
