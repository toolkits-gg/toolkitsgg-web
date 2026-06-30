// Core types shared across the offline-sync machinery.
//
// Architecture overview
// ---------------------
// Local writes (favorite a game, collect an item, edit a build) are recorded as
// PendingOps in IndexedDB (queue/) and replayed against the server one at a time
// by the sync runner (sync-runner.ts -> apply-pending-ops.ts). Each op names an
// `entity`; the handler registry (handler-registry.server.ts) maps that entity to
// a SyncHandler that knows how to write it to Postgres and resolve conflicts.
//
// Handlers come in two shapes, each built by a shared factory so the
// create/update/delete branching and last-write-wins (LWW) logic live in one place
// and individual entities only supply their Prisma read/write functions:
//
//   - Presence toggle  (presence-sync-handler.ts) — rows that either exist or not,
//     with no mutable fields (collected items, favorited games). Re-applying an
//     existing row is a noop.
//   - Content record   (record-sync-handler.ts)   — rows with mutable fields
//     beyond mere existence (builds, profiles). Re-applying overwrites the row
//     from the op payload.
//
// Each entity's handler is defined in a `<name>.sync.server.ts` module, kept
// separate from the plain CRUD data-access in its sibling `<name>.server.ts`.

import type { PendingOp } from "#/features/sync/local-data/queue/types.ts";

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

/**
 * Result of pulling a record key out of an op payload, returned by each entity's
 * `resolveKey`. A `false` result short-circuits the handler with a `SyncResult`
 * error so a malformed payload never reaches Prisma.
 */
type KeyResolution<TKey> =
	| { ok: true; key: TKey }
	| { ok: false; message: string };

/** Any record that carries an updatedAt timestamp — the minimum LWW needs to compare. */
interface HasUpdatedAt {
	updatedAt: string | Date | null | undefined;
}

export type {
	HasUpdatedAt,
	KeyResolution,
	SyncHandler,
	SyncOptions,
	SyncResult,
};
