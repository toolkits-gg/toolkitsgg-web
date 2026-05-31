import { createCollectedItemsDal } from "#/features/game/dal/collected-items/collected-items.dal.ts";
import {
	collectItemServerFn,
	listCollectedItemsByUserIdServerFn,
	listCollectedItemsServerFn,
	uncollectItemServerFn,
} from "#/games/slaythespire2/dal/server/collected-items";

export const slayTheSpire2CollectedItemsDal = createCollectedItemsDal({
	entityName: "slayTheSpire2CollectedItem",
	getModel: (idb) => idb.slayTheSpire2CollectedItem,
	serverFns: {
		collectItemServerFn,
		uncollectItemServerFn,
		listCollectedItemsServerFn,
		listCollectedItemsByUserIdServerFn,
	},
});
