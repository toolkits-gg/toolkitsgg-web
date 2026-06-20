import type { GameDBSeed } from "#/features/game/types.ts";
import { ALL_SLAYTHESPIRE2_ITEMS } from "#/games/slaythespire2/core/game-config/items";
import { prisma } from "@/prisma";

const slayTheSpire2DBSeed: GameDBSeed = {
	seed: async () => {
		await Promise.all([
			prisma.slayTheSpire2CollectedItem.deleteMany(),
			prisma.slayTheSpire2Item.deleteMany(),
		]);

		await prisma.slayTheSpire2Item.createMany({
			data: ALL_SLAYTHESPIRE2_ITEMS.map((item) => ({
				slug: item.id,
				name: item.name,
				category: item.category,
				disabled: false,
			})),
		});
	},
};

export { slayTheSpire2DBSeed };
