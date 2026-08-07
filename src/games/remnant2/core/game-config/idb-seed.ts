import type { GameIDBSeed } from "#/features/game/types.ts";
import { ITEMS } from "#/games/remnant2/core/game-config/items";
import { getIDBClient } from "#/integrations/prisma-idb/idb-client";

const remnant2IDBSeed: GameIDBSeed = {
	seedFlag: "idb-seeded-remnant2",
	seed: async () => {
		const idb = await getIDBClient();

		const existingCount = await idb.remnant2Item.count();
		if (existingCount === 0) {
			await idb.remnant2Item.createMany({
				data: ITEMS.collectable.map((item) => ({
					id: item.id,
					name: item.name,
					category: item.category,
					disabled: false,
				})),
			});
		}
	},
};

export { remnant2IDBSeed };
