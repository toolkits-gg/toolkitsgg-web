// Remnant 2 collected items: server-side CRUD. The table is the same presence
// join every game has, so the reads and writes come from the shared factory and
// only the prisma delegate is named here.

import { createCollectedItemsCrud } from "#/features/game/data/collected-items/collected-items-crud.server";
import { prisma } from "@/prisma";

const {
	collectItem,
	listCollectedItems,
	listCollectedItemsByUserId,
	uncollectItem,
} = createCollectedItemsCrud(prisma.remnant2CollectedItem);

export {
	collectItem,
	listCollectedItems,
	listCollectedItemsByUserId,
	uncollectItem,
};
