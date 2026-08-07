import type { GameDBSeed } from "#/features/game/types.ts";
import { ALL_SLAYTHESPIRE2_ITEMS } from "#/games/slaythespire2/core/game-config/items";
import { prisma } from "@/prisma";

const slayTheSpire2DBSeed: GameDBSeed = {
	seed: async () => {
		// Items are NOT deleted: SlayTheSpire2CollectedItem.itemId cascades from
		// here, so a deleteMany would wipe every user's collection on each reseed.
		await prisma.$transaction(
			ALL_SLAYTHESPIRE2_ITEMS.map((item) =>
				prisma.slayTheSpire2Item.upsert({
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

export { slayTheSpire2DBSeed };
