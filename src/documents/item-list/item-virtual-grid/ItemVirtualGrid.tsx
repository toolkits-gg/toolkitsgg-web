import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useLayoutEffect, useRef, useState } from "react";
import { ItemListEmptyState } from "#/documents/item-list/ItemListEmptyState.tsx";
import { ItemCard } from "#/documents/item-list/item-virtual-grid/ItemCard.tsx";
import type { CollectItemInput } from "#/features/game/data/types.ts";
import type { AppItem } from "#/features/game/types.ts";
import classes from "./ItemVirtualGrid.module.css";

const HEADER_HEIGHT = 64;
const ITEM_ROW_HEIGHT = 112;
const ROW_GAP = 8;
const MIN_CARD_WIDTH = 280;

type RowData =
	| { type: "header"; category: string }
	| { type: "items"; items: AppItem[] };

type AppItemVirtualGridProps = {
	items: AppItem[];
	categories: string[];
	collectableIds: ReadonlySet<string>;
	collectedIds: string[];
	dimUncollected: boolean;
	onCollect: ({ itemId, itemName }: CollectItemInput) => void;
	onUncollect: ({ itemId, itemName }: CollectItemInput) => void;
	onInfo: (item: AppItem) => void;
	readOnly?: boolean;
};

export const ItemVirtualGrid = ({
	items,
	categories,
	collectableIds,
	collectedIds,
	dimUncollected,
	onCollect,
	onUncollect,
	onInfo,
	readOnly = false,
}: AppItemVirtualGridProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [columns, setColumns] = useState(1);

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

	const isCollectable = (item: AppItem) => collectableIds.has(item.id);

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

	return (
		<div ref={containerRef} className={classes.container}>
			{rowData.length === 0 ? (
				<ItemListEmptyState />
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
											onInfo={onInfo}
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
