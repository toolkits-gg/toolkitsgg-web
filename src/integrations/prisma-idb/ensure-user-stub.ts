import type { getIDBClient } from "#/integrations/prisma-idb/idb-client.ts";

type IDBClient = Awaited<ReturnType<typeof getIDBClient>>;

/**
 * Ensures a stub `user` row exists in IndexedDB before writing a row that FKs to
 * it. The prisma-idb client enforces foreign keys, so junction rows (collected
 * items, etc.) written for an anon/offline user need their `user.id` to exist.
 * This is local-only plumbing — the real user row lives in Postgres.
 */
const ensureIdbUserStub = async (
	idb: IDBClient,
	userId: string,
): Promise<void> => {
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
};

export { ensureIdbUserStub };
