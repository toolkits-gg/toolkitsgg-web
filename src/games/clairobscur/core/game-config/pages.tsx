import { BuildCreatePage } from "#/components/pages/BuildCreate.tsx";
import { BuildEditPage } from "#/components/pages/BuildEdit.tsx";
import { BuildViewPage } from "#/components/pages/BuildView.tsx";
import { ItemListPage } from "#/components/pages/ItemList.tsx";
import { resolveLinkedItems } from "#/features/game/items/utils.ts";
import type { GamePages } from "#/features/game/types.ts";
import { ITEMS } from "#/games/clairobscur/core/game-config/items";
import { clairObscurCollectedItemsData } from "#/games/clairobscur/data/collected-items";

const PAGES: GamePages = {
	renderItemLookup: () => (
		<ItemListPage
			items={ITEMS}
			resolveLinkedItems={(item) => resolveLinkedItems(item, ITEMS.all)}
			data={clairObscurCollectedItemsData}
		/>
	),
	renderCollectedItems: ({ mode }) => (
		<ItemListPage
			items={ITEMS}
			resolveLinkedItems={(item) => resolveLinkedItems(item, ITEMS.all)}
			data={clairObscurCollectedItemsData}
			viewMode={mode}
		/>
	),
	renderCreateBuild: () => <BuildCreatePage />,
	renderEditBuild: () => <BuildEditPage />,
	renderViewBuild: () => <BuildViewPage />,
};

export { PAGES };
