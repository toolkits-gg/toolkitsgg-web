import { Box } from "@mantine/core";
import { ItemFilterBar } from "#/components/pages/item-list/ItemFilterBar.tsx";
import { AppItemVirtualGrid } from "#/components/AppItemVirtualGrid.tsx";
import { ItemCollectionShareButton } from "#/components/pages/item-list/ItemCollectionShareButton.tsx";
import { useCollectedItems } from "#/components/pages/item-list/use-collected-items.ts";
import { useItemFilters } from "#/components/pages/item-list/use-item-filters.ts";
import type { AnyGameConfig } from "#/features/game/registry/game-registry.tsx";
import type {AppItem, CollectedItemsViewMode, GameFilterConfig} from "#/features/game/types.ts";
import type {GameCollectedItemsDal} from "#/features/game/dal/types.ts";

export type ItemListPageProps = {
	items: AnyGameConfig["ITEMS"];
	resolveLinkedItems: (item: AppItem) => AppItem[];
	dal: GameCollectedItemsDal;
	gameFilterConfig?: GameFilterConfig;
	viewMode?: CollectedItemsViewMode;
};

export const ItemListPage = ({
	items,
	resolveLinkedItems,
	dal,
	gameFilterConfig,
	viewMode,
}: ItemListPageProps) => {
	const isCollectedItemsTab = viewMode !== undefined;
	const { collectedIds, isPublicView, handleCollect, handleUncollect } =
		useCollectedItems({ dal, viewMode });
	const filters = useItemFilters({
		items,
		collectedIds,
		gameFilterConfig,
		isCollectedItemsTab,
	});

	return (
		<Box>
			{isCollectedItemsTab && <ItemCollectionShareButton />}
			<ItemFilterBar
				search={filters.search}
				onSearchChange={(v) => filters.setUniversalParam("search", v)}
				showCollected={filters.showCollectedItems}
				onShowCollectedChange={(v) =>
					filters.setUniversalParam("showCollectedItems", v)
				}
				showUncollected={filters.showUncollectedItems}
				onShowUncollectedChange={(v) =>
					filters.setUniversalParam("showUncollectedItems", v)
				}
				dimUncollected={filters.dimUncollectedItems}
				onDimUncollectedChange={(v) =>
					filters.setUniversalParam("dimUncollectedItems", v)
				}
				showCollectableOnly={filters.showCollectableOnly}
				onShowCollectableOnlyChange={(v) =>
					filters.setUniversalParam("showCollectableOnly", v)
				}
				activeFilters={filters.activeFilters}
				onClearAllFilters={filters.clearAllFilters}
				renderGameFilters={filters.renderGameFilters}
				hasCollectableItems={items.collectable.length > 0}
			/>
			<Box p="md">
				<AppItemVirtualGrid
					items={filters.filteredItems}
					resolveLinkedItems={resolveLinkedItems}
					categories={filters.filteredCategories}
					uncollectableCategories={items.uncollectableCategories.map(String)}
					collectedIds={collectedIds}
					dimUncollected={filters.dimUncollectedItems}
					onCollect={handleCollect}
					onUncollect={handleUncollect}
					readOnly={isPublicView}
				/>
			</Box>
		</Box>
	);
};
