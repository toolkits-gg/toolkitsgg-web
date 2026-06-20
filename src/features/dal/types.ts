// Core types shared across all DAL layers.

import type { QueryKey } from "@tanstack/react-query";
import type {
	PendingOp,
	PendingOpOperation,
	PendingOpSummary,
} from "#/features/dal/queue/types.ts";

/** "remote" when the user is authenticated and online; "local" otherwise. */
type Backend = "remote" | "local";

/** Passed to every DAL action so it knows who is acting and where to persist. */
interface DalContext {
	/** UUID persisted in localStorage — always present, even before sign-in. */
	anonUserId: string;
	/** Better Auth user ID — null when the user is not authenticated. */
	authUserId: string | null;
	/** Execution target for this operation. */
	backend: Backend;
}

/**
 * Result returned by a SyncHandler after attempting to apply a pending op.
 * - `applied`  — op was written to the server; caller marks the op "synced".
 * - `conflict` — server record is newer; caller marks the op "conflict" and surfaces the server record.
 * - `noop`     — op is redundant (already applied); caller deletes the op.
 * - `error`    — handler threw or returned an error; caller marks the op "failed".
 */
type SyncResult =
	| { status: "applied" }
	| { status: "conflict"; serverRecordJson: string }
	| { status: "noop" }
	| { status: "error"; message: string };

/**
 * Options forwarded from the sync runner / caller to a SyncHandler.
 * Used today only to opt out of LWW conflict checks when the user explicitly
 * chose "Keep mine" on a previously-conflicted op.
 */
interface SyncOptions {
	/** When true, the handler skips its LWW check and applies the op unconditionally. */
	force?: boolean;
}

/**
 * Server-side function that applies a single pending op for an entity.
 * `userId` is the authenticated user — always resolved before the handler is called.
 */
type SyncHandler = (
	op: PendingOp,
	userId: string,
	options?: SyncOptions,
) => Promise<SyncResult>;

/** Defines a read operation: how to build the cache key and how to fetch from each backend. */
interface DalReadAction<Input, Output> {
	kind: "read";
	/**
	 * Returns the TanStack Query cache key for this input. Namespaced with `["dal", ...]` by toQueryOptions.
	 * Receives the DalContext so actions can include the active user identity in the key, which is required
	 * for any action with per-user data, so the anon -> authed transition triggers a key change.
	 */
	queryKey: (input: Input, ctx?: DalContext) => QueryKey;
	/** Fetches from the server (Postgres via TanStack Start server function). */
	remote: (input: Input, ctx: DalContext) => Promise<Output>;
	/** Fetches from IndexedDB. */
	local: (input: Input, ctx: DalContext) => Promise<Output>;
}

/** Defines a write operation: how to execute it on each backend and how to sync queued ops. */
interface DalWriteAction<Input, Output> {
	kind: "write";
	/** String key that must match the entry in the sync-handler registry. */
	entity: string;
	/** Operation type stored on PendingOp; used by LWW conflict resolution. */
	operation: PendingOpOperation;
	/** Builds a stable key used by the server to deduplicate retried ops within the TTL window. */
	buildIdempotencyKey: (input: Input, ctx: DalContext) => string;
	/** Additional entity names whose queries should be invalidated after a successful mutation. */
	invalidates: readonly string[];
	/** Writes directly to the server. Used when backend === "remote" (no queue involved). */
	remote: (input: Input, ctx: DalContext) => Promise<Output>;
	/** Writes to IndexedDB. Used when backend === "local"; the op is then enqueued for sync. */
	local: (input: Input, ctx: DalContext) => Promise<Output>;
	/**
	 * Returns the server's last-known `updatedAt` for the record being written.
	 * Captured before the local write and stored on the PendingOp as the LWW baseline.
	 * If the server has advanced past this value by sync time, a concurrent writer won.
	 * Return null for pure creates or when the record doesn't exist locally yet.
	 */
	getServerUpdatedAt?: (
		input: Input,
		ctx: DalContext,
	) => Promise<string | null>;
	/**
	 * Returns a display snapshot for the pending op. Called at enqueue time only
	 * (not on the remote path, which doesn't queue). The result is stored on the
	 * PendingOp so the data-sync UI can render a user-friendly description.
	 */
	describe?: (input: Input, ctx: DalContext) => PendingOpSummary;
}

type DalAction<Input = unknown, Output = unknown> =
	| DalReadAction<Input, Output>
	| DalWriteAction<Input, Output>;

export type {
	Backend,
	DalAction,
	DalContext,
	DalReadAction,
	DalWriteAction,
	SyncHandler,
	SyncOptions,
	SyncResult,
};
