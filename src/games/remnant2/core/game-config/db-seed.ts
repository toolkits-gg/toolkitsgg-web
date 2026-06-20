import type { GameDBSeed } from "#/features/game/types.ts";
import { ALL_REMNANT2_ITEMS } from "#/games/remnant2/core/game-config/items";
import { prisma } from "@/prisma";

const remnant2DBSeed: GameDBSeed = {
	seed: async () => {
		await Promise.all([
			prisma.remnant2BuildItem.deleteMany(),
			prisma.remnant2BuildsOnCollections.deleteMany(),
			prisma.remnant2BuildTag.deleteMany(),
			prisma.remnant2BuildCollectionCount.deleteMany(),
			prisma.remnant2BuildDuplicateCount.deleteMany(),
			prisma.remnant2BuildLikeCount.deleteMany(),
			prisma.remnant2BuildViewCount.deleteMany(),
			prisma.remnant2CollectedItem.deleteMany(),
		]);
		await Promise.all([
			prisma.remnant2Build.deleteMany(),
			prisma.remnant2BuildCollection.deleteMany(),
		]);
		await prisma.remnant2Item.deleteMany();

		await prisma.remnant2Item.createMany({
			data: ALL_REMNANT2_ITEMS.map((item) => ({
				slug: item.id,
				name: item.name,
				category: item.category,
				disabled: false,
			})),
		});
	},
};

export { remnant2DBSeed };
