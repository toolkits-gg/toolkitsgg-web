// IndexedDB layer for any game's collected-item feature.
// Each game's Prisma IDB client is a different generated type; this factory works
// with any of them by taking a `getModel` accessor instead of importing game-specific types.
import { getIDBClient } from "#/integrations/prisma-idb/idb-client";
import type {CollectedItemRecord} from "#/features/game/dal/types.ts";

/**
 * Structural interface for the IDB model delegate.
 * Each game's Prisma IDB client is a different generated type; this interface
 * lets the factory work with any of them without importing game-specific types.
 */
interface CollectedItemIDBDelegate {
	findMany: (args: {
		where: { userId: string };
	}) => Promise<CollectedItemRecord[]>;
	findFirst: (args: {
		where: { userId: string; itemId: string };
	}) => Promise<CollectedItemRecord | null>;
	upsert: (args: {
		where: { userId_itemId: { userId: string; itemId: string } };
		update: object;
		create: { userId: string; itemId: string };
	}) => Promise<CollectedItemRecord>;
	deleteMany: (args: {
		where: { userId: string; itemId?: string };
	}) => Promise<unknown>;
}

/** Inferred type of the Prisma IDB client returned by getIDBClient(). */
type IDBClient = Awaited<ReturnType<typeof getIDBClient>>;

/** Creates the IndexedDB helpers for a game's collected-item model. */
const createCollectedItemsIdb = (
	getModel: (idb: IDBClient) => CollectedItemIDBDelegate,
) => {
	const list = async (userId: string): Promise<CollectedItemRecord[]> => {
		const idb = await getIDBClient();
		return getModel(idb).findMany({ where: { userId } });
	};

	const collect = async (
		userId: string,
		itemId: string,
	): Promise<CollectedItemRecord> => {
		const idb = await getIDBClient();
		// IDB enforces a FK from collectedItem.userId -> user.id, so we must
		// ensure a stub user row exists before writing the item row.
		await idb.user.upsert({
			where: { id: userId },
			update: {},
			create: {
				id: userId,
				username: `_local_${userId}`,
				email: `_local_${userId}@local.invalid`,
				emailVerified: false,
			},
		});
		return getModel(idb).upsert({
			where: { userId_itemId: { userId, itemId } },
			update: {},
			create: { userId, itemId },
		});
	};

	const uncollect = async (userId: string, itemId: string): Promise<void> => {
		const idb = await getIDBClient();
		// deleteMany (not delete) so this is a no-op if the item is already absent.
		await getModel(idb).deleteMany({ where: { userId, itemId } });
	};

	// Reads the pre-write `updatedAt` of the local record as the LWW baseline.
	const readUpdatedAt = async (
		userId: string,
		itemId: string,
	): Promise<string | null> => {
		const idb = await getIDBClient();
		const record = await getModel(idb).findFirst({ where: { userId, itemId } });
		if (!record) return null;
		const t = record.updatedAt;
		return t instanceof Date ? t.toISOString() : (t ?? null);
	};

	return { list, collect, uncollect, readUpdatedAt };
};

export type { CollectedItemIDBDelegate, IDBClient };
export { createCollectedItemsIdb };
