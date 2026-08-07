import type { GameIDBSeed } from "#/features/game/types.ts";
import { ITEMS } from "#/games/slaythespire2/core/game-config/items";
import { getIDBClient } from "#/integrations/prisma-idb/idb-client";

const slayTheSpire2IDBSeed: GameIDBSeed = {
	seedFlag: "idb-seeded-slaythespire2",
	seed: async () => {
		const idb = await getIDBClient();

		const existingCount = await idb.slayTheSpire2Item.count();
		if (existingCount === 0) {
			await idb.slayTheSpire2Item.createMany({
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

export { slayTheSpire2IDBSeed };
