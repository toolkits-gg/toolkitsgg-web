import { upsertInChunks } from "#/features/game/seed-utils.ts";
import type { GameDBSeed } from "#/features/game/types.ts";
import { ALL_REMNANT2_ITEMS } from "#/games/remnant2/core/game-config/items";
import { prisma } from "@/prisma";

const remnant2DBSeed: GameDBSeed = {
	resetUserData: async () => {
		// Build-scoped data is disposable, so it is reset wholesale.
		await Promise.all([
			prisma.remnant2BuildItem.deleteMany(),
			prisma.remnant2BuildsOnCollections.deleteMany(),
			prisma.remnant2BuildTag.deleteMany(),
			prisma.remnant2BuildFeedMembership.deleteMany(),
			prisma.remnant2BuildUpvote.deleteMany(),
			prisma.remnant2BuildView.deleteMany(),
		]);
		await Promise.all([
			prisma.remnant2Build.deleteMany(),
			prisma.remnant2BuildCollection.deleteMany(),
		]);
	},

	seedReferenceData: async () => {
		// Items are NOT deleted: Remnant2CollectedItem.itemId cascades from here,
		// so a deleteMany would wipe every user's collection on each reseed.
		await upsertInChunks(
			ALL_REMNANT2_ITEMS.map((item) =>
				prisma.remnant2Item.upsert({
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

export { remnant2DBSeed };
