import { BuildCreatePage } from "#/components/pages/BuildCreate.tsx";
import { BuildEditPage } from "#/components/pages/BuildEdit.tsx";
import { BuildViewPage } from "#/components/pages/BuildView.tsx";
import { AppItemPage } from "#/features/game/items/AppItemPage";
import { resolveLinkedItems } from "#/features/game/items/utils.ts";
import type { GamePages } from "#/features/game/types.ts";
import { ITEMS } from "#/games/clairobscur/core/game-config/items";
import { clairObscurCollectedItemsDal } from "#/games/clairobscur/dal/collected-items";

const PAGES: GamePages = {
	renderItemLookup: () => (
		<AppItemPage
			items={ITEMS}
			resolveLinkedItems={(item) => resolveLinkedItems(item, ITEMS.all)}
			dal={clairObscurCollectedItemsDal}
		/>
	),
	renderCollectedItems: ({ mode }) => (
		<AppItemPage
			items={ITEMS}
			resolveLinkedItems={(item) => resolveLinkedItems(item, ITEMS.all)}
			dal={clairObscurCollectedItemsDal}
			viewMode={mode}
		/>
	),
	renderCreateBuild: () => <BuildCreatePage />,
	renderEditBuild: () => <BuildEditPage />,
	renderViewBuild: () => <BuildViewPage />,
};

export { PAGES };
