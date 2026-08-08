// Slay the Spire 2 collected items: the client hooks bundle handed to the generic
// ItemList page. The hooks themselves are shared - every game's collected-item
// logic is identical - so this names the backend and nothing else.

import { createCollectedItemsData } from "#/features/game/data/collected-items/create-collected-items-data";
import { slayTheSpire2CollectedItemStore } from "#/features/local-db/game-stores";
import {
	collectItemServerFn,
	listCollectedItemsByUserIdServerFn,
	listCollectedItemsServerFn,
	uncollectItemServerFn,
} from "#/games/slaythespire2/data/collected-items/collected-items";

const slayTheSpire2CollectedItemsData = createCollectedItemsData({
	gameId: "slaythespire2",
	entity: "slayTheSpire2CollectedItem",
	serverFns: {
		collectItemServerFn,
		uncollectItemServerFn,
		listCollectedItemsServerFn,
		listCollectedItemsByUserIdServerFn,
	},
	localStore: slayTheSpire2CollectedItemStore,
});

export { slayTheSpire2CollectedItemsData };
