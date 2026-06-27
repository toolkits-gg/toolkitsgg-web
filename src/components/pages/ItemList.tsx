import { Box } from "@mantine/core";
import { AppItemVirtualGrid } from "#/components/AppItemVirtualGrid.tsx";
import { ItemCollectionShareButton } from "#/components/pages/item-list/ItemCollectionShareButton.tsx";
import { ItemFilterBar } from "#/components/pages/item-list/ItemFilterBar.tsx";
import { useCollectedItems } from "#/components/pages/item-list/use-collected-items.ts";
import { useItemFilters } from "#/components/pages/item-list/use-item-filters.ts";
import type { GameCollectedItemsData } from "#/features/game/data/types.ts";
import type {
	AnyGameConfig,
	AppItem,
	CollectedItemsViewMode,
	GameFilterConfig,
} from "#/features/game/types.ts";

export type ItemListPageProps = {
	items: AnyGameConfig["ITEMS"];
	resolveLinkedItems: (item: AppItem) => AppItem[];
	data: GameCollectedItemsData;
	gameFilterConfig?: GameFilterConfig;
	viewMode?: CollectedItemsViewMode;
};

export const ItemListPage = ({
	items,
	resolveLinkedItems,
	data,
	gameFilterConfig,
	viewMode,
}: ItemListPageProps) => {
	const isCollectedItemsTab = viewMode !== undefined;
	const { collectedIds, isPublicView, handleCollect, handleUncollect } =
		useCollectedItems({ data, viewMode });
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
