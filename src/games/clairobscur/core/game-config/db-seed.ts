import { upsertInChunks } from "#/features/game/seed-utils.ts";
import type { GameDBSeed } from "#/features/game/types.ts";
import { ALL_CLAIROBSCUR_ITEMS } from "#/games/clairobscur/core/game-config/items";
import { prisma } from "@/prisma";

const clairObscurDBSeed: GameDBSeed = {
	seedReferenceData: async () => {
		// Items are NOT deleted: ClairObscurCollectedItem.itemId cascades from here,
		// so a deleteMany would wipe every user's collection on each reseed.
		await upsertInChunks(
			ALL_CLAIROBSCUR_ITEMS.map((item) =>
				prisma.clairObscurItem.upsert({
					where: { id: item.id },
					update: { name: item.name, category: item.category, disabled: false },
					create: {
						id: item.id,
						name: item.name,
						category: item.category,
						disabled: false,
					},
				}),
			),
		);
	},
};

export { clairObscurDBSeed };
