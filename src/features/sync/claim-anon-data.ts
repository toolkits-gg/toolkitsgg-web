/**
 * Hands an anonymous visitor's local data over to the account they just signed
 * in to.
 *
 * Two things have to happen and the order matters. Reads flip to the auth user
 * id the instant a session exists, so the IDB rows are re-keyed first or the
 * user watches their builds and collected items disappear. Draining the queue
 * afterwards is what gets the same data to the server; the server ignores
 * `op.anonUserId` and attributes every replayed write to the session user, so
 * the re-key and the drain agree on the owner without coordinating.
 */

import { claimLocalRows } from "#/features/local-db/claim-rows";
import {
	overrideId,
	userAvatarOverrideStore,
	userFavoriteGameStore,
	userHeaderImageOverrideStore,
	userProfileStore,
} from "#/features/local-db/user-stores";
import {
	clearAnonUserId,
	getAnonUserId,
} from "#/features/sync/identity/anon-id";
import { listOps } from "#/features/sync/queue/pending-ops";
import { type SyncAllReport, syncOps } from "#/features/sync/sync-runner";
import { allGameLocalClaims } from "#/games-registry/idb-registry";
import type { GameId } from "@/prisma";

interface ClaimResult {
	/** False when there was nothing to claim, so callers can stay silent. */
	claimed: boolean;
	report: SyncAllReport;
}

const EMPTY: ClaimResult = {
	claimed: false,
	report: { applied: 0, superseded: 0, noops: 0, errors: 0, skipped: 0 },
};

/**
 * An account that already has a profile keeps it; the anon draft is discarded
 * rather than overwriting whatever the user set on another device.
 */
const claimLocalProfile = async (
	fromUserId: string,
	toUserId: string,
): Promise<void> => {
	const draft = await userProfileStore.findUnique({
		where: { userId: fromUserId },
	});
	if (!draft) return;

	const existing = await userProfileStore.findUnique({
		where: { userId: toUserId },
	});
	if (!existing) {
		await userProfileStore.create({ data: { ...draft, userId: toUserId } });
	}
	await userProfileStore.deleteMany({ where: { userId: fromUserId } });
};

/** Overrides are keyed on `${userId}:${gameId}`, so the key moves with the owner. */
const rekeyOverride = (row: { gameId: GameId }, toUserId: string) => ({
	id: overrideId(toUserId, row.gameId),
});

/** Re-keys the four user-owned stores. */
const claimLocalStores = async (
	fromUserId: string,
	toUserId: string,
): Promise<void> => {
	await claimLocalProfile(fromUserId, toUserId);
	await claimLocalRows(userFavoriteGameStore, "userId", fromUserId, toUserId);
	await claimLocalRows(
		userAvatarOverrideStore,
		"userId",
		fromUserId,
		toUserId,
		rekeyOverride,
	);
	await claimLocalRows(
		userHeaderImageOverrideStore,
		"userId",
		fromUserId,
		toUserId,
		rekeyOverride,
	);
};

/**
 * Claims local data for `authUserId` and drains the queue.
 *
 * Draining covers every game rather than the active one: the data-sync screen
 * filters ops by game so the user can reason about one game at a time, but an
 * automatic claim that did the same would silently strand the rest.
 */
const claimAnonData = async (authUserId: string): Promise<ClaimResult> => {
	if (typeof window === "undefined") return EMPTY;

	const anonUserId = getAnonUserId();
	if (!anonUserId || anonUserId === authUserId) return EMPTY;

	const pending = (await listOps()).filter(
		(op) => op.status !== "synced" && op.anonUserId === anonUserId,
	);
	for (const claim of Object.values(allGameLocalClaims)) {
		await claim.claimLocalRows(anonUserId, authUserId);
	}
	await claimLocalStores(anonUserId, authUserId);

	const report = pending.length
		? await syncOps(pending, { stopOnError: true })
		: EMPTY.report;

	// The anon identity is only safe to drop once nothing is still keyed to it;
	// a surviving op needs its anonUserId to match on the next attempt.
	const remaining = (await listOps()).filter(
		(op) => op.anonUserId === anonUserId && op.status !== "synced",
	);
	if (!remaining.length) clearAnonUserId();

	return { claimed: true, report };
};

export type { ClaimResult };
export { claimAnonData };
