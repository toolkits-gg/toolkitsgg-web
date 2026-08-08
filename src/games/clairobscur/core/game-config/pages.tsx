import { ItemListPage } from "#/components/pages/ItemList";
import { resolveLinkedItems } from "#/features/game/items/utils";
import type { GamePages } from "#/features/game/types";
import { ITEMS } from "#/games/clairobscur/core/game-config/items";
import { LINKED_ITEM_CATEGORIES } from "#/games/clairobscur/core/game-config/linked-item-categories";
import { clairObscurCollectedItemsData } from "#/games/clairobscur/data/collected-items/use-collected-items";

const PAGES: GamePages = {
	renderItemLookup: () => (
		<ItemListPage
			items={ITEMS}
			resolveLinkedItems={(item) =>
				resolveLinkedItems(item, ITEMS.all, LINKED_ITEM_CATEGORIES)
			}
			data={clairObscurCollectedItemsData}
		/>
	),
	renderCollectedItems: ({ mode }) => (
		<ItemListPage
			items={ITEMS}
			resolveLinkedItems={(item) =>
				resolveLinkedItems(item, ITEMS.all, LINKED_ITEM_CATEGORIES)
			}
			data={clairObscurCollectedItemsData}
			viewMode={mode}
		/>
	),
};

export { PAGES };
