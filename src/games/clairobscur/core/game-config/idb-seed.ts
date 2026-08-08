import type { GameIDBSeed } from "#/features/game/types.ts";
import { ITEMS } from "#/games/clairobscur/core/game-config/items";
import { getIDBClient } from "#/integrations/prisma-idb/idb-client";

const clairObscurIDBSeed: GameIDBSeed = {
	seed: async () => {
		const idb = await getIDBClient();

		const existingCount = await idb.clairObscurItem.count();
		if (existingCount === ITEMS.collectable.length) return;

		const existing = await idb.clairObscurItem.findMany({
			select: { id: true },
		});
		const existingIds = new Set(existing.map((item) => item.id));
		const missing = ITEMS.collectable.filter(
			(item) => !existingIds.has(item.id),
		);
		if (missing.length === 0) return;

		await idb.clairObscurItem.createMany({
			data: missing.map((item) => ({
				id: item.id,
				name: item.name,
				category: item.category,
				disabled: false,
			})),
		});
	},
};

export { clairObscurIDBSeed };
