import { Box, Modal } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { ItemCollectionShareButton } from "#/documents/item-list/ItemCollectionShareButton.tsx";
import {
	ItemExportMenu,
	type ItemExportScope,
} from "#/documents/item-list/ItemExportMenu.tsx";
import { ItemFilterBar } from "#/documents/item-list/item-filter-bar/ItemFilterBar.tsx";
import { ItemInfoModal } from "#/documents/item-list/item-info-modal/ItemInfoModal.tsx";
import { ItemVirtualGrid } from "#/documents/item-list/item-virtual-grid/ItemVirtualGrid.tsx";
import { ItemVirtualTable } from "#/documents/item-list/item-virtual-table/ItemVirtualTable.tsx";
import { useCollectedItems } from "#/documents/item-list/use-collected-items.ts";
import { useItemFilters } from "#/documents/item-list/use-item-filters.ts";
import { useItemListLayout } from "#/documents/item-list/use-item-list-layout.ts";
import { downloadCsv } from "#/features/export/csv.ts";
import type { GameCollectedItemsData } from "#/features/game/data/types.ts";
import {
	buildItemCsv,
	type ItemCsvColumn,
} from "#/features/game/items/item-csv.ts";
import type {
	AnyGameConfig,
	AppItem,
	CollectedItemsViewMode,
	GameFilterConfig,
} from "#/features/game/types.ts";
import { useGameId } from "#/features/game/use-game-id.ts";

type ItemListDocumentProps = {
	items: AnyGameConfig["ITEMS"];
	resolveLinkedItems: (item: AppItem) => AppItem[];
	resolvePrimaryLinkedItem?: (item: AppItem) => AppItem | null;
	data: GameCollectedItemsData;
	gameFilterConfig?: GameFilterConfig;
	/** Game-specific CSV columns appended to the shared set on export. */
	itemCsvColumns?: ItemCsvColumn[];
	viewMode?: CollectedItemsViewMode;
};

export const ItemListDocument = ({
	items,
	resolveLinkedItems,
	resolvePrimaryLinkedItem,
	data,
	gameFilterConfig,
	itemCsvColumns,
	viewMode,
}: ItemListDocumentProps) => {
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
	const gameId = useGameId();

	const handleExport = (scope: ItemExportScope) => {
		const exported = scope === "filtered" ? filters.filteredItems : items.all;
		const csv = buildItemCsv({
			items: exported,
			collectedIds,
			extraColumns: itemCsvColumns,
		});
		const date = new Date().toISOString().slice(0, 10);
		downloadCsv(`${gameId}-items-${scope}-${date}.csv`, csv);
		notifications.show({
			title: "Export complete",
			message: `Exported ${exported.length.toLocaleString()} items`,
			color: "green",
		});
	};

	// Following a linked item swaps the modal's item, so keep the trail to go back.
	const [itemHistory, setItemHistory] = useState<AppItem[]>([]);
	const activeItem = itemHistory.at(-1) ?? null;

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
				onClose={() => setItemHistory([])}
				title={activeItem?.name}
				size="md"
				centered
			>
				{activeItem && (
					<ItemInfoModal
						item={activeItem}
						resolveLinkedItems={resolveLinkedItems}
						resolvePrimaryLinkedItem={resolvePrimaryLinkedItem}
						isCollected={collectedIds.includes(activeItem.id)}
						isCollectable={collectableIds.has(activeItem.id)}
						onCollect={handleCollect}
						onUncollect={handleUncollect}
						onSelectLinkedItem={(item) =>
							setItemHistory((prev) => [...prev, item])
						}
						onBack={() => setItemHistory((prev) => prev.slice(0, -1))}
						canGoBack={itemHistory.length > 1}
						readOnly={isPublicView}
					/>
				)}
			</Modal>
			{isCollectedItemsTab && <ItemCollectionShareButton />}
			<ItemFilterBar
				ref={filterBarRef}
				filters={filters}
				exportMenu={
					<ItemExportMenu
						filteredCount={filters.filteredItems.length}
						allCount={items.all.length}
						onExport={handleExport}
					/>
				}
				hasCollectableItems={items.collectable.length > 0}
				layout={layout}
				onLayoutChange={setLayout}
			/>
			<Box p="md">
				{layout === "table" ? (
					<ItemVirtualTable
						items={filters.filteredItems}
						collectableIds={collectableIds}
						collectedIds={collectedIds}
						dimUncollected={filters.dimUncollectedItems}
						onCollect={handleCollect}
						onUncollect={handleUncollect}
						onInfo={(item) => setItemHistory([item])}
						readOnly={isPublicView}
					/>
				) : (
					<ItemVirtualGrid
						items={filters.filteredItems}
						categories={filters.filteredCategories}
						collectableIds={collectableIds}
						collectedIds={collectedIds}
						dimUncollected={filters.dimUncollectedItems}
						onCollect={handleCollect}
						onUncollect={handleUncollect}
						onInfo={(item) => setItemHistory([item])}
						readOnly={isPublicView}
					/>
				)}
			</Box>
		</Box>
	);
};
