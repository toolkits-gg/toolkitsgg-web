import type { GameIDBSeed } from "#/features/game/types.ts";
import { ITEMS } from "#/games/clairobscur/core/game-config/items";
import { getIDBClient } from "#/integrations/prisma-idb/idb-client";

const clairObscurIDBSeed: GameIDBSeed = {
	seedFlag: "idb-seeded-clairobscur",
	seed: async () => {
		const idb = await getIDBClient();

		const existingCount = await idb.clairObscurItem.count();
		if (existingCount === 0) {
			await idb.clairObscurItem.createMany({
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

export { clairObscurIDBSeed };
