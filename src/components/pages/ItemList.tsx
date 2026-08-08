import { Box, Modal } from "@mantine/core";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { AppItemInfoModal } from "#/components/pages/item-list/AppItemInfoModal.tsx";
import { AppItemVirtualGrid } from "#/components/pages/item-list/AppItemVirtualGrid.tsx";
import { AppItemVirtualTable } from "#/components/pages/item-list/AppItemVirtualTable.tsx";
import { ItemCollectionShareButton } from "#/components/pages/item-list/ItemCollectionShareButton.tsx";
import { ItemFilterBar } from "#/components/pages/item-list/ItemFilterBar.tsx";
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
	const collectableIds = useMemo(
		() => new Set(items.collectable.map((item) => item.id)),
		[items.collectable],
	);
	const filters = useItemFilters({
		items,
		collectableIds,
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
			if (!entry) return;
			// Border box, so the bar's bottom border is not double-counted as a gap.
			const height =
				entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height;
			page.style.setProperty("--item-filter-bar-height", `${height}px`);
		});
		observer.observe(bar);
		return () => observer.disconnect();
	}, []);

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
						isCollectable={collectableIds.has(activeItem.id)}
						onCollect={handleCollect}
						onUncollect={handleUncollect}
						readOnly={isPublicView}
					/>
				)}
			</Modal>
			{isCollectedItemsTab && <ItemCollectionShareButton />}
			<ItemFilterBar
				ref={filterBarRef}
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
			<Box p="md">
				{layout === "table" ? (
					<AppItemVirtualTable
						items={filters.filteredItems}
						collectableIds={collectableIds}
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
						collectableIds={collectableIds}
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
