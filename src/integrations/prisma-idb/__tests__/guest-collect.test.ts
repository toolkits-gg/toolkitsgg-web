// @vitest-environment jsdom
import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { remnant2IDBSeed } from "#/games/remnant2/core/game-config/idb-seed.ts";
import { ITEMS } from "#/games/remnant2/core/game-config/items";
import { ensureIdbUserStub } from "#/integrations/prisma-idb/ensure-user-stub.ts";
import { getIDBClient } from "#/integrations/prisma-idb/idb-client.ts";
import { seedIDBForGame } from "#/integrations/prisma-idb/idb-seed.ts";

describe("guest collect write path", () => {
	it("collects an item after seeding", async () => {
		const idb = await getIDBClient();
		const itemId = ITEMS.collectable[0].id;
		const userId = "anon-test-user";

		await expect(
			idb.remnant2CollectedItem.upsert({
				where: { userId_itemId: { userId, itemId } },
				update: {},
				create: { userId, itemId },
			}),
		).rejects.toThrow();

		await seedIDBForGame("remnant2");
		await ensureIdbUserStub(idb, userId);

		const record = await idb.remnant2CollectedItem.upsert({
			where: { userId_itemId: { userId, itemId } },
			update: {},
			create: { userId, itemId },
		});
		expect(record.itemId).toBe(itemId);

		const rows = await idb.remnant2CollectedItem.findMany({
			where: { userId },
		});
		expect(rows.map((r) => r.itemId)).toEqual([itemId]);

		expect(await idb.remnant2Item.count()).toBe(ITEMS.collectable.length);
	});

	it("backfills an item missing from the local store", async () => {
		const idb = await getIDBClient();
		const victim = ITEMS.collectable[1].id;
		await idb.remnant2Item.delete({ where: { id: victim } });
		expect(await idb.remnant2Item.count()).toBe(ITEMS.collectable.length - 1);

		// seedIDBForGame memoizes per page load, so drive the seed directly.
		await remnant2IDBSeed.seed();
		expect(await idb.remnant2Item.count()).toBe(ITEMS.collectable.length);
		expect(
			await idb.remnant2Item.findUnique({ where: { id: victim } }),
		).not.toBeNull();
	});
});
