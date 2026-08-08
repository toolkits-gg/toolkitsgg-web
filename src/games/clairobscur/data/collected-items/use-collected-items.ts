// Clair Obscur collected items: the client hooks bundle handed to the generic
// ItemList page. The hooks themselves are shared - every game's collected-item
// logic is identical - so this names the backend and nothing else.

import { createCollectedItemsData } from "#/features/game/data/collected-items/create-collected-items-data";
import { clairObscurCollectedItemStore } from "#/features/local-db/game-stores";
import {
	collectItemServerFn,
	listCollectedItemsByUserIdServerFn,
	listCollectedItemsServerFn,
	uncollectItemServerFn,
} from "#/games/clairobscur/data/collected-items/collected-items";

const clairObscurCollectedItemsData = createCollectedItemsData({
	gameId: "clairobscur",
	entity: "clairObscurCollectedItem",
	serverFns: {
		collectItemServerFn,
		uncollectItemServerFn,
		listCollectedItemsServerFn,
		listCollectedItemsByUserIdServerFn,
	},
	localStore: clairObscurCollectedItemStore,
});

export { clairObscurCollectedItemsData };
