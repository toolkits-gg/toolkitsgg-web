import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import type {
	ListOpsFilter,
	PendingOp,
	PendingOpStatus,
} from "#/features/sync/local-data/queue/types.ts";

const DB_NAME = "toolkitsgg-pending-ops";
const DB_VERSION = 2;
const STORE_NAME = "ops";

interface PendingOpsDB extends DBSchema {
	ops: {
		key: string;
		value: PendingOp;
		indexes: {
			createdAt: string;
			entity: string;
			status: PendingOpStatus;
			idempotencyKey: string;
		};
	};
}

/** Lazy singleton — initialized on first access. Setting to null forces a fresh open (used in tests). */
let dbPromise: Promise<IDBPDatabase<PendingOpsDB>> | null = null;

/** Returns the pending-ops DB connection, or null when IndexedDB is unavailable (SSR). */
const getDB = (): Promise<IDBPDatabase<PendingOpsDB>> | null => {
	if (typeof indexedDB === "undefined") return null;
	if (!dbPromise) {
		dbPromise = openDB<PendingOpsDB>(DB_NAME, DB_VERSION, {
			upgrade(db, oldVersion, _newVersion, tx) {
				if (oldVersion < 1) {
					const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
					store.createIndex("createdAt", "createdAt");
					store.createIndex("entity", "entity");
					store.createIndex("status", "status");
				}
				if (oldVersion < 2) {
					tx.objectStore(STORE_NAME).createIndex(
						"idempotencyKey",
						"idempotencyKey",
					);
				}
			},
		});
	}
	return dbPromise;
};

/**
 * Input for enqueueOp. The `id` and `status` overrides exist for test seeding only;
 * normal callers should omit them to get an auto-generated UUID and "pending" status.
 */
type EnqueueInput = Omit<
	PendingOp,
	"id" | "createdAt" | "updatedAt" | "status"
> & {
	id?: string;
	status?: PendingOpStatus;
};

/** Stores a new pending op in IndexedDB. Returns null if IndexedDB is unavailable. */
const enqueueOp = async (input: EnqueueInput): Promise<PendingOp | null> => {
	const db = await getDB();
	if (!db) return null;

	// Skip if an equivalent op is already waiting — prevents duplicates from rapid mutations.
	const existing = await db.getFromIndex(
		STORE_NAME,
		"idempotencyKey",
		input.idempotencyKey,
	);
	if (
		existing &&
		(existing.status === "pending" || existing.status === "syncing")
	) {
		return existing;
	}

	const now = new Date().toISOString();
	const op: PendingOp = {
		id: input.id ?? crypto.randomUUID(),
		createdAt: now,
		updatedAt: now,
		status: input.status ?? "pending",
		anonUserId: input.anonUserId,
		entity: input.entity,
		operation: input.operation,
		payload: input.payload,
		idempotencyKey: input.idempotencyKey,
		lastError: input.lastError,
		serverUpdatedAt: input.serverUpdatedAt,
		summary: input.summary,
	};
	await db.put(STORE_NAME, op);
	return op;
};

/**
 * Returns all ops ordered by createdAt (FIFO).
 * FIFO ordering matters during sync — ops must be applied in the order they were created
 * to preserve causal relationships (e.g. create before delete).
 */
const listOps = async (filter?: ListOpsFilter): Promise<PendingOp[]> => {
	const db = await getDB();
	if (!db) return [];
	const all = await db.getAllFromIndex(STORE_NAME, "createdAt");
	if (!filter) return all;
	return all.filter((op) => {
		if (filter.status && op.status !== filter.status) return false;
		return !(filter.entity && op.entity !== filter.entity);
	});
};

/** Fetches a single op by id. Returns null if not found or IndexedDB unavailable. */
const getOp = async (id: string): Promise<PendingOp | null> => {
	const db = await getDB();
	if (!db) return null;
	return (await db.get(STORE_NAME, id)) ?? null;
};

/**
 * Updates an op's status and optionally its lastError.
 * `lastError` is preserved across transitions only when the new status is "failed";
 * any other transition clears it unless a new error string is explicitly provided.
 * `conflictInfo` is preserved only when the new status is "conflict"; any other
 * transition clears it so a stale created-builds snapshot isn't shown after the op moves on.
 */
const markStatus = async (
	id: string,
	status: PendingOpStatus,
	lastError?: string,
): Promise<PendingOp | null> => {
	const db = await getDB();
	if (!db) return null;
	const existing = await db.get(STORE_NAME, id);
	if (!existing) return null;
	const next: PendingOp = {
		...existing,
		status,
		updatedAt: new Date().toISOString(),
		lastError:
			lastError ?? (status === "failed" ? existing.lastError : undefined),
		conflictInfo: status === "conflict" ? existing.conflictInfo : undefined,
	};
	await db.put(STORE_NAME, next);
	return next;
};

/**
 * Transitions an op to "conflict" and stores the created-builds record snapshot.
 * Used by the sync runner when a handler reports `{ status: "conflict", serverRecordJson }`,
 * so the data-sync UI can show the user what the created-builds has and offer a resolution path.
 */
const markConflict = async (
	id: string,
	serverRecordJson: string,
): Promise<PendingOp | null> => {
	const db = await getDB();
	if (!db) return null;
	const existing = await db.get(STORE_NAME, id);
	if (!existing) return null;
	const next: PendingOp = {
		...existing,
		status: "conflict",
		updatedAt: new Date().toISOString(),
		lastError: undefined,
		conflictInfo: {
			serverRecordJson,
			detectedAt: new Date().toISOString(),
		},
	};
	await db.put(STORE_NAME, next);
	return next;
};

/** Permanently removes a single op. Used for noop results during sync. */
const deleteOp = async (id: string): Promise<void> => {
	const db = await getDB();
	if (!db) return;
	await db.delete(STORE_NAME, id);
};

/**
 * Removes all ops with status "synced". Returns the number deleted.
 * This is a housekeeping operation — not part of the sync flow itself.
 * Run periodically to prevent the queue from growing without bound.
 */
const clearSynced = async (): Promise<number> => {
	const db = await getDB();
	if (!db) return 0;
	const tx = db.transaction(STORE_NAME, "readwrite");
	const index = tx.store.index("status");
	let cursor = await index.openCursor("synced");
	let count = 0;
	while (cursor) {
		await cursor.delete();
		count += 1;
		cursor = await cursor.continue();
	}
	await tx.done;
	return count;
};

/**
 * Closes and deletes the database. Only exported for test teardown.
 * The DB must be closed before deletion; an open connection blocks the delete request.
 */
const _resetForTests = async (): Promise<void> => {
	if (dbPromise) {
		const db = await dbPromise;
		db.close();
		dbPromise = null;
	}
	if (typeof indexedDB !== "undefined") {
		await new Promise<void>((resolve, reject) => {
			const req = indexedDB.deleteDatabase(DB_NAME);
			req.onsuccess = () => resolve();
			req.onerror = () => reject(req.error);
			req.onblocked = () => resolve();
		});
	}
};

export {
	_resetForTests,
	clearSynced,
	deleteOp,
	enqueueOp,
	getOp,
	listOps,
	markConflict,
	markStatus,
};
