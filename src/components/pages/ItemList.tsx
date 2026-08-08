import { Box, Modal } from "@mantine/core";
import { useLayoutEffect, useRef, useState } from "react";
import { AppItemInfoModal } from "#/components/AppItemInfoModal.tsx";
import { AppItemVirtualGrid } from "#/components/AppItemVirtualGrid.tsx";
import { AppItemVirtualTable } from "#/components/AppItemVirtualTable.tsx";
import { ItemCollectionShareButton } from "#/components/pages/item-list/ItemCollectionShareButton.tsx";
import { ItemFilterBar } from "#/components/pages/item-list/ItemFilterBar.tsx";
import { isItemCollectable } from "#/components/pages/item-list/is-item-collectable.ts";
import { useCollectedItems } from "#/components/pages/item-list/use-collected-items.ts";
import { useItemFilters } from "#/components/pages/item-list/use-item-filters.ts";
import { useItemListLayout } from "#/components/pages/item-list/use-item-list-layout.ts";
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
	const [layout, setLayout] = useItemListLayout();
	const [activeItem, setActiveItem] = useState<AppItem | null>(null);

	// The filter bar is sticky and its height changes with the active-filter row,
	// so publish it as a custom property for the table header to stick beneath.
	const filterBarRef = useRef<HTMLDivElement>(null);
	const pageRef = useRef<HTMLDivElement>(null);
	useLayoutEffect(() => {
		const bar = filterBarRef.current;
		const page = pageRef.current;
		if (!bar || !page) return;

		const observer = new ResizeObserver(([entry]) => {
			page.style.setProperty(
				"--item-filter-bar-height",
				`${entry.contentRect.height}px`,
			);
		});
		observer.observe(bar);
		return () => observer.disconnect();
	}, []);

	const uncollectableCategories = items.uncollectableCategories.map(String);

	return (
		<Box ref={pageRef}>
			<Modal
				opened={activeItem !== null}
				onClose={() => setActiveItem(null)}
				title={activeItem?.name}
				size="md"
				centered
			>
				{activeItem && (
					<AppItemInfoModal
						item={activeItem}
						resolveLinkedItems={resolveLinkedItems}
						isCollected={collectedIds.includes(activeItem.id)}
						isCollectable={isItemCollectable(
							activeItem.category,
							uncollectableCategories,
						)}
						onCollect={handleCollect}
						onUncollect={handleUncollect}
						readOnly={isPublicView}
					/>
				)}
			</Modal>
			{isCollectedItemsTab && <ItemCollectionShareButton />}
			<Box ref={filterBarRef}>
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
					layout={layout}
					onLayoutChange={setLayout}
				/>
			</Box>
			<Box p="md">
				{layout === "table" ? (
					<AppItemVirtualTable
						items={filters.filteredItems}
						uncollectableCategories={uncollectableCategories}
						collectedIds={collectedIds}
						dimUncollected={filters.dimUncollectedItems}
						onCollect={handleCollect}
						onUncollect={handleUncollect}
						onInfo={setActiveItem}
						readOnly={isPublicView}
					/>
				) : (
					<AppItemVirtualGrid
						items={filters.filteredItems}
						categories={filters.filteredCategories}
						uncollectableCategories={uncollectableCategories}
						collectedIds={collectedIds}
						dimUncollected={filters.dimUncollectedItems}
						onCollect={handleCollect}
						onUncollect={handleUncollect}
						onInfo={setActiveItem}
						readOnly={isPublicView}
					/>
				)}
			</Box>
		</Box>
	);
};
