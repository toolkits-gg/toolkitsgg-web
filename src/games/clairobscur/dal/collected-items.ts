import { createCollectedItemsDal } from "#/features/game/dal/collected-items/collected-items.dal.ts";
import {
	collectItemServerFn,
	listCollectedItemsByUserIdServerFn,
	listCollectedItemsServerFn,
	uncollectItemServerFn,
} from "#/games/clairobscur/dal/server/collected-items";

export const clairObscurCollectedItemsDal = createCollectedItemsDal({
	entityName: "clairObscurCollectedItem",
	getModel: (idb) => idb.clairObscurCollectedItem,
	serverFns: {
		collectItemServerFn,
		uncollectItemServerFn,
		listCollectedItemsServerFn,
		listCollectedItemsByUserIdServerFn,
	},
});
