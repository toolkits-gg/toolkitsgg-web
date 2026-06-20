import type { GameDBSeed } from "#/features/game/types.ts";
import { ALL_CLAIROBSCUR_ITEMS } from "#/games/clairobscur/core/game-config/items";
import { prisma } from "@/prisma";

const clairObscurDBSeed: GameDBSeed = {
	seed: async () => {
		await Promise.all([
			prisma.clairObscurCollectedItem.deleteMany(),
			prisma.clairObscurItem.deleteMany(),
		]);

		await prisma.clairObscurItem.createMany({
			data: ALL_CLAIROBSCUR_ITEMS.map((item) => ({
				slug: item.id,
				name: item.name,
				category: item.category,
				disabled: false,
			})),
		});
	},
};

export { clairObscurDBSeed };
