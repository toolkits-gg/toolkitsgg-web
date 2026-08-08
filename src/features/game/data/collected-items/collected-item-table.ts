/**
 * The slice of a collected-item table the shared factories touch.
 *
 * Every game's collected-item table is the same two-column join keyed on
 * `userId_itemId`, and both backends expose it: `prisma.<game>CollectedItem` on
 * the server and the game's local store in the browser. Declaring the shapes
 * structurally is what lets one factory serve every game, rather than three
 * copies per backend.
 *
 * The two shapes differ only in how a row is addressed - prisma nests the
 * compound key under `userId_itemId`, the local store takes the fields flat.
 */

import type { CollectedItemRecord } from "#/features/game/data/types";
import type { HasUpdatedAt } from "#/features/sync/types";

type ItemKey = { userId: string; itemId: string };

/** The server side, backed by a prisma delegate. */
type CollectedItemTable = {
	findMany: (args: {
		where: { userId: string };
	}) => Promise<CollectedItemRecord[]>;
	/**
	 * Reads for last-write-wins, so the row must carry `updatedAt`.
	 * `CollectedItemRecord` leaves it optional for the client-side shape; the
	 * stored row always has the column.
	 */
	findUnique: (args: {
		where: { userId_itemId: ItemKey };
	}) => Promise<(CollectedItemRecord & HasUpdatedAt) | null>;
	upsert: (args: {
		where: { userId_itemId: ItemKey };
		update: Record<string, never>;
		create: ItemKey;
	}) => Promise<CollectedItemRecord>;
	create: (args: { data: ItemKey }) => Promise<unknown>;
	deleteMany: (args: { where: ItemKey }) => Promise<unknown>;
};

/** The browser side, backed by one of the local stores in `local/game-stores.ts`. */
type CollectedItemStore = {
	findMany(args: { where: { userId: string } }): Promise<CollectedItemRecord[]>;
	findUnique(args: {
		where: ItemKey;
	}): Promise<(CollectedItemRecord & HasUpdatedAt) | null>;
	upsert(args: {
		where: ItemKey;
		update: Record<string, never>;
		create: ItemKey;
	}): Promise<CollectedItemRecord>;
	deleteMany(args: { where: ItemKey }): Promise<void>;
};

/**
 * Narrows a generated prisma delegate to the shape above. The generated types
 * carry overloads and result generics that no hand-written structural type can
 * satisfy, so the cast is the boundary - keep it to this one function rather
 * than spreading it across every game. The local stores need no equivalent;
 * they satisfy `CollectedItemStore` on their own.
 */
const asCollectedItemTable = (delegate: unknown): CollectedItemTable =>
	delegate as CollectedItemTable;

export type { CollectedItemStore, CollectedItemTable };
export { asCollectedItemTable };
