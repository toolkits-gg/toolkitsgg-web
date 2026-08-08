// Remnant 2 collected items: the client hooks bundle handed to the generic
// ItemList page. The hooks themselves are shared - every game's collected-item
// logic is identical - so this names the backend and nothing else.

import { createCollectedItemsData } from "#/features/game/data/collected-items/create-collected-items-data";
import { remnant2CollectedItemStore } from "#/features/local-db/game-stores";
import {
	collectItemServerFn,
	listCollectedItemsByUserIdServerFn,
	listCollectedItemsServerFn,
	uncollectItemServerFn,
} from "#/games/remnant2/data/collected-items/collected-items";

const remnant2CollectedItemsData = createCollectedItemsData({
	gameId: "remnant2",
	entity: "remnant2CollectedItem",
	serverFns: {
		collectItemServerFn,
		uncollectItemServerFn,
		listCollectedItemsServerFn,
		listCollectedItemsByUserIdServerFn,
	},
	localStore: remnant2CollectedItemStore,
});

export { remnant2CollectedItemsData };
