import { type DBSchema, type IDBPDatabase, openDB, type StoreNames } from "idb";
import type {
	LocalUserAvatarOverride,
	LocalUserFavoriteGame,
	LocalUserHeaderImageOverride,
	LocalUserProfile,
} from "#/features/local-db/types";
import type { PendingOp } from "#/features/sync/queue/types";
import type {
	ClairObscurCollectedItem,
	Remnant2Build,
	Remnant2BuildCollection,
	Remnant2BuildItem,
	Remnant2BuildsOnCollections,
	Remnant2BuildTag,
	Remnant2BuildUpvote,
	Remnant2CollectedItem,
	SlayTheSpire2CollectedItem,
} from "@/prisma";

const DB_NAME = "toolkitsgg-local";
/** Increment whenever the schema changes; migrations run in the `upgrade` callback on next open. */
const DB_VERSION = 5;

/**
 * Every store the app keeps locally. The user-owned four carry hand-written
 * mirrors because their key paths include the `GameId` enum; the game stores
 * carry the Prisma model types directly, so a local row is the same shape the
 * server would have written. `ops` is the sync queue, which has no server model
 * at all - the row is the wire shape the replay sends.
 */
interface LocalDB extends DBSchema {
	userProfile: {
		key: string;
		value: LocalUserProfile;
		indexes: { userId: string };
	};
	userFavoriteGame: {
		key: [string, string];
		value: LocalUserFavoriteGame;
		indexes: { userId: string };
	};
	userAvatarOverride: {
		key: string;
		value: LocalUserAvatarOverride;
		indexes: { userId: string };
	};
	userHeaderImageOverride: {
		key: string;
		value: LocalUserHeaderImageOverride;
		indexes: { userId: string };
	};
	remnant2Build: {
		key: string;
		value: Remnant2Build;
		indexes: { createdById: string; variantCollectionId: string };
	};
	remnant2BuildItem: {
		key: [string, string];
		value: Remnant2BuildItem;
		indexes: { buildId: string };
	};
	remnant2BuildTag: {
		key: [string, string];
		value: Remnant2BuildTag;
		indexes: { buildId: string };
	};
	remnant2BuildCollection: {
		key: string;
		value: Remnant2BuildCollection;
		indexes: { createdById: string };
	};
	remnant2BuildsOnCollections: {
		key: [string, string];
		value: Remnant2BuildsOnCollections;
		indexes: { collectionId: string; buildId: string };
	};
	remnant2BuildUpvote: {
		key: [string, string];
		value: Remnant2BuildUpvote;
		indexes: { userId: string; buildId: string };
	};
	remnant2CollectedItem: {
		key: [string, string];
		value: Remnant2CollectedItem;
		indexes: { userId: string };
	};
	clairObscurCollectedItem: {
		key: [string, string];
		value: ClairObscurCollectedItem;
		indexes: { userId: string };
	};
	slayTheSpire2CollectedItem: {
		key: [string, string];
		value: SlayTheSpire2CollectedItem;
		indexes: { userId: string };
	};
	ops: {
		key: string;
		value: PendingOp;
		indexes: {
			createdAt: string;
			entity: string;
			status: string;
			idempotencyKey: string;
		};
	};
}

type StoreDefinition = {
	name: StoreNames<LocalDB>;
	keyPath: string | string[];
	indexes?: string[];
};

const STORE_DEFINITIONS: StoreDefinition[] = [
	{ name: "userProfile", keyPath: "userId", indexes: ["userId"] },
	{
		name: "userFavoriteGame",
		keyPath: ["userId", "gameId"],
		indexes: ["userId"],
	},
	{ name: "userAvatarOverride", keyPath: "id", indexes: ["userId"] },
	{ name: "userHeaderImageOverride", keyPath: "id", indexes: ["userId"] },
	{
		name: "remnant2Build",
		keyPath: "id",
		indexes: ["createdById", "variantCollectionId"],
	},
	{
		name: "remnant2BuildItem",
		keyPath: ["buildId", "itemId"],
		indexes: ["buildId"],
	},
	{
		name: "remnant2BuildTag",
		keyPath: ["buildId", "tag"],
		indexes: ["buildId"],
	},
	{ name: "remnant2BuildCollection", keyPath: "id", indexes: ["createdById"] },
	{
		name: "remnant2BuildsOnCollections",
		keyPath: ["collectionId", "buildId"],
		indexes: ["collectionId", "buildId"],
	},
	{
		name: "remnant2BuildUpvote",
		keyPath: ["buildId", "userId"],
		indexes: ["userId", "buildId"],
	},
	{
		name: "remnant2CollectedItem",
		keyPath: ["userId", "itemId"],
		indexes: ["userId"],
	},
	{
		name: "clairObscurCollectedItem",
		keyPath: ["userId", "itemId"],
		indexes: ["userId"],
	},
	{
		name: "slayTheSpire2CollectedItem",
		keyPath: ["userId", "itemId"],
		indexes: ["userId"],
	},
	{
		name: "ops",
		keyPath: "id",
		indexes: ["createdAt", "entity", "status", "idempotencyKey"],
	},
];

/** Lazy singleton - one DB connection per page load. Null until first access. */
let dbPromise: Promise<IDBPDatabase<LocalDB>> | null = null;

/**
 * Opens (or returns the cached) toolkitsgg-local IndexedDB connection.
 * Returns null during SSR where IndexedDB is unavailable.
 */
const getLocalDB = (): Promise<IDBPDatabase<LocalDB>> | null => {
	if (typeof indexedDB === "undefined") return null;
	if (!dbPromise) {
		dbPromise = openDB<LocalDB>(DB_NAME, DB_VERSION, {
			// Creating only what is missing covers both a first visit and an
			// existing database gaining stores or indexes, so the version history
			// does not have to be replayed step by step.
			upgrade(db, _oldVersion, _newVersion, tx) {
				for (const definition of STORE_DEFINITIONS) {
					// idb's generics cannot follow a store looked up by a name that
					// is only known at runtime; the native interface types both
					// members used here without a cast per argument.
					const store = (db.objectStoreNames.contains(definition.name)
						? tx.objectStore(definition.name)
						: db.createObjectStore(definition.name, {
								keyPath: definition.keyPath,
							})) as unknown as IDBObjectStore;
					for (const index of definition.indexes ?? []) {
						if (store.indexNames.contains(index)) continue;
						store.createIndex(index, index);
					}
				}
			},
		});
	}
	return dbPromise;
};

export type { LocalDB };
export { getLocalDB };
