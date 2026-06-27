import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import {
	STORE_USER_AVATAR_OVERRIDE,
	STORE_USER_FAVORITE_GAME,
	STORE_USER_PROFILE,
} from "#/features/sync/local/constants";
import type {
	LocalUserAvatarOverride,
	LocalUserFavoriteGame,
	LocalUserProfile,
} from "#/features/sync/local/types";

const DB_NAME = "toolkitsgg-local";
/** Increment whenever the schema changes; migrations run in the `upgrade` callback on next open. */
const DB_VERSION = 2;

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
}

/** Lazy singleton — one DB connection per page load. Null until first access. */
let dbPromise: Promise<IDBPDatabase<LocalDB>> | null = null;

/**
 * Opens (or returns the cached) toolkitsgg-local IndexedDB connection.
 * Returns null during SSR where IndexedDB is unavailable.
 */
const getLocalDB = (): Promise<IDBPDatabase<LocalDB>> | null => {
	if (typeof indexedDB === "undefined") return null;
	if (!dbPromise) {
		dbPromise = openDB<LocalDB>(DB_NAME, DB_VERSION, {
			upgrade(db, oldVersion) {
				if (oldVersion < 1) {
					if (!db.objectStoreNames.contains(STORE_USER_FAVORITE_GAME)) {
						const store = db.createObjectStore(STORE_USER_FAVORITE_GAME, {
							keyPath: ["userId", "gameId"],
						});
						store.createIndex("userId", "userId");
					}
					// v1 userAvatarOverride used imageUrl; we'll recreate it in v2
					if (!db.objectStoreNames.contains(STORE_USER_AVATAR_OVERRIDE)) {
						const store = db.createObjectStore(STORE_USER_AVATAR_OVERRIDE, {
							keyPath: "id",
						});
						store.createIndex("userId", "userId");
					}
				}

				if (oldVersion < 2) {
					// v1 -> v2: avatar schema changed from imageUrl to avatarId/avatarGameId.
					// The old store must be dropped and recreated because IDB can't alter key paths.
					if (db.objectStoreNames.contains(STORE_USER_AVATAR_OVERRIDE)) {
						db.deleteObjectStore(STORE_USER_AVATAR_OVERRIDE);
					}
					const overrideStore = db.createObjectStore(
						STORE_USER_AVATAR_OVERRIDE,
						{ keyPath: "id" },
					);
					overrideStore.createIndex("userId", "userId");

					// Add userProfile store (new in v2)
					if (!db.objectStoreNames.contains(STORE_USER_PROFILE)) {
						const profileStore = db.createObjectStore(STORE_USER_PROFILE, {
							keyPath: "userId",
						});
						profileStore.createIndex("userId", "userId");
					}
				}
			},
		});
	}
	return dbPromise;
};

/** Closes and deletes the database. Only exported for test teardown. */
const _resetLocalDBForTests = async (): Promise<void> => {
	if (dbPromise) {
		const db = await dbPromise;
		db.close();
		dbPromise = null;
	}
	if (typeof indexedDB === "undefined") return;
	await new Promise<void>((resolve) => {
		const req = indexedDB.deleteDatabase(DB_NAME);
		req.onsuccess = () => resolve();
		req.onerror = () => resolve();
		req.onblocked = () => resolve();
	});
};

export { _resetLocalDBForTests, getLocalDB };
