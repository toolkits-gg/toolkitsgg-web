// Core types shared across the offline-sync machinery.

import type { PendingOp } from "#/features/sync/queue/types.ts";

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

export type { SyncHandler, SyncOptions, SyncResult };
