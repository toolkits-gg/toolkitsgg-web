import { Box, Modal } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { AppItemInfoModal } from "#/components/pages/item-list/AppItemInfoModal";
import { AppItemVirtualGrid } from "#/components/pages/item-list/AppItemVirtualGrid";
import { AppItemVirtualTable } from "#/components/pages/item-list/AppItemVirtualTable";
import { ItemCollectionShareButton } from "#/components/pages/item-list/ItemCollectionShareButton";
import {
	ItemExportMenu,
	type ItemExportScope,
} from "#/components/pages/item-list/ItemExportMenu";
import { ItemFilterBar } from "#/components/pages/item-list/ItemFilterBar";
import { useCollectedItems } from "#/components/pages/item-list/use-collected-items";
import { useItemFilters } from "#/components/pages/item-list/use-item-filters";
import { useItemListLayout } from "#/components/pages/item-list/use-item-list-layout";
import { downloadCsv } from "#/features/export/csv";
import type { GameCollectedItemsData } from "#/features/game/data/types";
import {
	buildItemCsv,
	type ItemCsvColumn,
} from "#/features/game/items/item-csv";
import type {
	AnyGameConfig,
	AppItem,
	CollectedItemsViewMode,
	GameFilterConfig,
} from "#/features/game/types";
import { useGameId } from "#/features/game/use-game-id";

type ItemListPageProps = {
	items: AnyGameConfig["ITEMS"];
	resolveLinkedItems: (item: AppItem) => AppItem[];
	resolvePrimaryLinkedItem?: (item: AppItem) => AppItem | null;
	data: GameCollectedItemsData;
	gameFilterConfig?: GameFilterConfig;
	/** Game-specific CSV columns appended to the shared set on export. */
	itemCsvColumns?: ItemCsvColumn[];
	viewMode?: CollectedItemsViewMode;
};

export const ItemListPage = ({
	items,
	resolveLinkedItems,
	resolvePrimaryLinkedItem,
	data,
	gameFilterConfig,
	itemCsvColumns,
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
					<AppItemInfoModal
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
					<AppItemVirtualTable
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
					<AppItemVirtualGrid
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
