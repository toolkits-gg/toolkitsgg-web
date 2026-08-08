/**
 * How much anonymous work is sitting on this device waiting to be claimed.
 *
 * Counted in pending ops rather than IndexedDB rows because every anonymous
 * write enqueues an op beside its local mirror, and a drain (the only thing
 * that removes ops) cannot run while signed out. "Changes" is also what the
 * data-sync screen already calls them, so the two numbers agree.
 */

import { getAnonUserId } from "#/features/sync/identity/anon-id";
import { listOps } from "#/features/sync/queue/pending-ops";

interface ClaimableAnonData {
	anonUserId: string | null;
	count: number;
}

/**
 * Counts across every game rather than the active one: a claim drains the whole
 * queue, so a game-scoped count would understate what the user is agreeing to.
 */
const countClaimableAnonOps = async (): Promise<ClaimableAnonData> => {
	const anonUserId = getAnonUserId();
	if (!anonUserId) return { anonUserId: null, count: 0 };

	const ops = await listOps();
	const count = ops.filter(
		(op) => op.anonUserId === anonUserId && op.status !== "synced",
	).length;

	return { anonUserId, count };
};

export type { ClaimableAnonData };
export { countClaimableAnonOps };
