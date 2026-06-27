import { Modal, Text } from "@mantine/core";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useLayoutEffect, useRef, useState } from "react";
import { ItemCard } from "#/components/pages/item-list/ItemCard.tsx";
import { AppItemInfoModal } from "#/components/AppItemInfoModal.tsx";
import classes from "./AppItemVirtualGrid.module.css";
import type {AppItem} from "#/features/game/types.ts";
import type {CollectItemInput} from "#/features/game/dal/types.ts";

const HEADER_HEIGHT = 64;
const ITEM_ROW_HEIGHT = 112;
const ROW_GAP = 8;
const MIN_CARD_WIDTH = 280;

type RowData =
	| { type: "header"; category: string }
	| { type: "items"; items: AppItem[] };

export type AppItemVirtualGridProps = {
	items: AppItem[];
	resolveLinkedItems: (item: AppItem) => AppItem[];
	categories: string[];
	uncollectableCategories: string[];
	collectedIds: string[];
	dimUncollected: boolean;
	onCollect: ({ itemId, itemName }: CollectItemInput) => void;
	onUncollect: ({ itemId, itemName }: CollectItemInput) => void;
	readOnly?: boolean;
};

export const AppItemVirtualGrid = ({
	items,
	resolveLinkedItems,
	categories,
	uncollectableCategories,
	collectedIds,
	dimUncollected,
	onCollect,
	onUncollect,
	readOnly = false,
}: AppItemVirtualGridProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [columns, setColumns] = useState(1);
	const [activeItem, setActiveItem] = useState<AppItem | null>(null);

	useLayoutEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		const computeColumns = (width: number) =>
			Math.max(1, Math.floor(width / MIN_CARD_WIDTH));

		// Runs before paint, so first paint already
		// has the correct column count instead of flashing at 1 then reflowing.
		setColumns(computeColumns(el.getBoundingClientRect().width));

		// Subsequent resizes only.
		const observer = new ResizeObserver(([entry]) => {
			setColumns(computeColumns(entry.contentRect.width));
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const isCollectable = (item: AppItem) =>
		!uncollectableCategories.some(
			(uc) => String(item.category).toLowerCase() === uc.toLowerCase(),
		);

	const rowData: RowData[] = [];
	for (const category of categories) {
		const categoryItems = items.filter(
			(item) => String(item.category) === category,
		);
		if (categoryItems.length === 0) continue;
		rowData.push({ type: "header", category });
		for (let i = 0; i < categoryItems.length; i += columns) {
			rowData.push({
				type: "items",
				items: categoryItems.slice(i, i + columns),
			});
		}
	}

	const virtualizer = useWindowVirtualizer({
		count: rowData.length,
		estimateSize: (index) => {
			const row = rowData[index];
			if (!row) return ITEM_ROW_HEIGHT;
			return row.type === "header" ? HEADER_HEIGHT : ITEM_ROW_HEIGHT + ROW_GAP;
		},
		overscan: 4,
		scrollMargin: containerRef.current?.offsetTop ?? 0,
	});

	const handleInfo = (item: AppItem) => {
		setActiveItem(item);
	};

	return (
		<div ref={containerRef} className={classes.container}>
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
						isCollectable={isCollectable(activeItem)}
						onCollect={onCollect}
						onUncollect={onUncollect}
						readOnly={readOnly}
					/>
				)}
			</Modal>
			{rowData.length === 0 ? (
				<div className={classes.emptyState}>
					<Text size="xl" fw={600} c="dimmed">
						No items found
					</Text>
					<Text size="sm" c="dimmed" ta="center">
						Try adjusting your filters or search query
					</Text>
				</div>
			) : (
				<div
					className={classes.inner}
					style={{ height: virtualizer.getTotalSize() }}
				>
					{virtualizer.getVirtualItems().map((virtualRow) => {
						const row = rowData[virtualRow.index];
						if (!row) return null;

						const translateY =
							virtualRow.start - virtualizer.options.scrollMargin;

						if (row.type === "header") {
							const collectedInCat = items.filter(
								(item) =>
									String(item.category) === row.category &&
									collectedIds.includes(item.id) &&
									isCollectable(item),
							).length;
							const collectableInCat = items.filter(
								(item) =>
									String(item.category) === row.category && isCollectable(item),
							).length;

							return (
								<div
									key={virtualRow.key}
									style={{
										position: "absolute",
										top: 0,
										left: 0,
										width: "100%",
										height: virtualRow.size,
										transform: `translateY(${translateY}px)`,
									}}
								>
									<div className={classes.categoryHeader}>
										<span className={classes.categoryTitle}>
											{row.category
												.split("_")
												.map(
													(w) =>
														w.charAt(0).toUpperCase() +
														w.slice(1).toLowerCase(),
												)
												.join(" ")}
										</span>
										{collectableInCat > 0 && (
											<span className={classes.categoryCounts}>
												{collectedInCat} / {collectableInCat} collected
											</span>
										)}
									</div>
								</div>
							);
						}

						return (
							<div
								key={virtualRow.key}
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									height: virtualRow.size - ROW_GAP,
									transform: `translateY(${translateY}px)`,
								}}
							>
								<div
									className={classes.itemRow}
									style={{
										gridTemplateColumns: `repeat(${columns}, 1fr)`,
									}}
								>
									{row.items.map((item) => (
										<ItemCard
											key={item.id}
											item={item}
											collectedIds={collectedIds}
											isCollectable={isCollectable(item)}
											dimUncollected={dimUncollected}
											onCollect={onCollect}
											onUncollect={onUncollect}
											onInfo={handleInfo}
											readOnly={readOnly}
										/>
									))}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};
