import { Box } from "@mantine/core";
import { ItemFilterBar } from "#/features/game/items/ItemFilterBar";
import { ItemVirtualGrid } from "#/features/game/items/ItemVirtualGrid";
import { ShareCollectionButton } from "#/features/game/items/ShareCollectionButton";
import type {
	AppItem,
	CollectedItemsViewMode,
	GameCollectedItemsDal,
	GameFilterConfig,
} from "#/features/game/items/types";
import { useCollectedItems } from "#/features/game/items/use-collected-items";
import { useItemFilters } from "#/features/game/items/use-item-filters";
import type { AnyGameConfig } from "#/features/game/registry/game-registry";

type AppItemPageProps = {
	items: AnyGameConfig["ITEMS"];
	resolveLinkedItems: (item: AppItem) => AppItem[];
	dal: GameCollectedItemsDal;
	gameFilterConfig?: GameFilterConfig;
	viewMode?: CollectedItemsViewMode;
};

const AppItemPage = ({
	items,
	resolveLinkedItems,
	dal,
	gameFilterConfig,
	viewMode,
}: AppItemPageProps) => {
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
			{isCollectedItemsTab && <ShareCollectionButton />}
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
				<ItemVirtualGrid
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

export { AppItemPage };
export type { AppItemPageProps };
