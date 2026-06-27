// Last-write-wins conflict resolution used when syncing pending ops to the server.

/**
 * - `local-wins`  — the pending op should be applied (local change is authoritative).
 * - `server-wins` — the server record is newer; treat as a conflict and surface it.
 * - `equal`       — the op is redundant (already synced); safe to delete it.
 */
type LwwComparison = "local-wins" | "server-wins" | "equal";

/** Any record that carries an updatedAt timestamp. */
interface HasUpdatedAt {
	updatedAt: string | Date | null | undefined;
}

/**
 * Converts a timestamp value to milliseconds, returning null for missing or invalid dates.
 * `new Date("invalid").getTime()` returns NaN, which `Number.isFinite` rejects, treating it as absent.
 */
const toTime = (value: string | Date | null | undefined): number | null => {
	if (!value) return null;
	const date = typeof value === "string" ? new Date(value) : value;
	const time = date.getTime();
	return Number.isFinite(time) ? time : null;
};

/**
 * Determines the LWW outcome for a pending op against the current server record.
 *
 * `op.serverUpdatedAt` is the snapshot of the server record's `updatedAt` at the time the
 * local write was created — the "baseline". The algorithm:
 *
 * 1. Server record missing -> no one else has written; local op wins unconditionally.
 * 2. Baseline missing (op predates serverUpdatedAt tracking):
 *    fall back to comparing the op's own creation time to the server record's time.
 * 3. Server advanced past the baseline -> another writer committed after this op was enqueued -> conflict.
 * 4. Server behind the baseline -> should not happen in practice; treat as local-wins to avoid data loss.
 * 5. Server equals the baseline -> op is redundant (already synced via another path) -> noop.
 */
const compareTimestamps = (
	serverRecord: HasUpdatedAt | null | undefined,
	op: { serverUpdatedAt?: string | null; updatedAt?: string | null },
): LwwComparison => {
	const serverTime = toTime(serverRecord?.updatedAt);
	const baselineTime = toTime(op.serverUpdatedAt);
	const opTime = toTime(op.updatedAt);

	// No server record — local op wins unconditionally.
	if (serverTime === null) return "local-wins";

	if (baselineTime === null) {
		// Action hasn't implemented getServerUpdatedAt (e.g. favorites, user-profile).
		// Fall back to comparing op creation time vs. server record time — a close approximation.
		if (opTime === null) return "server-wins";
		if (opTime > serverTime) return "local-wins";
		if (opTime < serverTime) return "server-wins";
		return "equal";
	}

	// Server advanced past the baseline: another writer beat this op.
	if (serverTime > baselineTime) return "server-wins";
	// Server is behind the baseline: should not happen; prefer local to avoid data loss.
	if (serverTime < baselineTime) return "local-wins";
	// Server matches the baseline exactly: op is redundant.
	return "equal";
};

export { compareTimestamps, type HasUpdatedAt };
