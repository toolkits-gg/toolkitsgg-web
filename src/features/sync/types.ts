import type { PendingOp } from "#/features/sync/queue/types";

/**
 * Result returned by a SyncHandler after attempting to apply a pending op.
 * - `applied`    - op was written to the server; caller marks the op "synced".
 * - `superseded` - server record is newer; the local op is discarded.
 * - `noop`       - op is redundant (already applied); caller deletes the op.
 * - `error`      - handler threw or returned an error; caller marks the op "failed".
 */
type SyncResult =
	| { status: "applied" }
	| { status: "superseded" }
	| { status: "noop" }
	| { status: "error"; message: string };

/**
 * Server-side function that applies a single pending op for an entity.
 * `userId` is the authenticated user - always resolved before the handler is called.
 */
type SyncHandler = (op: PendingOp, userId: string) => Promise<SyncResult>;

/**
 * Result of pulling a record key out of an op payload, returned by each entity's
 * `resolveKey`. A `false` result short-circuits the handler with a `SyncResult`
 * error so a malformed payload never reaches Prisma.
 */
type KeyResolution<TKey> =
	| { ok: true; key: TKey }
	| { ok: false; message: string };

/** Any record that carries an updatedAt timestamp - the minimum LWW needs to compare. */
interface HasUpdatedAt {
	updatedAt: string | Date | null | undefined;
}

export type { HasUpdatedAt, KeyResolution, SyncHandler, SyncResult };
