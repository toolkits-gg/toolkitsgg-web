import {
	getCoreRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useRef, useState } from "react";
import { ItemTableHeaderRow } from "#/components/pages/item-list/app-item-virtual-table/ItemTableHeaderRow";
import {
	ItemTableRow,
	ROW_HEIGHT,
} from "#/components/pages/item-list/app-item-virtual-table/ItemTableRow";
import {
	createItemTableColumns,
	useItemTableColumnVisibility,
} from "#/components/pages/item-list/app-item-virtual-table/item-table-columns";
import { ItemListEmptyState } from "#/components/pages/item-list/ItemListEmptyState";
import type { CollectItemInput } from "#/features/game/data/types";
import type { AppItem } from "#/features/game/types";
import classes from "./AppItemVirtualTable.module.css";

type AppItemVirtualTableProps = {
	items: AppItem[];
	collectableIds: ReadonlySet<string>;
	collectedIds: string[];
	dimUncollected: boolean;
	onCollect: ({ itemId, itemName }: CollectItemInput) => void;
	onUncollect: ({ itemId, itemName }: CollectItemInput) => void;
	onInfo: (item: AppItem) => void;
	readOnly?: boolean;
};

export const AppItemVirtualTable = ({
	items,
	collectableIds,
	collectedIds,
	dimUncollected,
	onCollect,
	onUncollect,
	onInfo,
	readOnly = false,
}: AppItemVirtualTableProps) => {
	const bodyRef = useRef<HTMLTableSectionElement>(null);
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "name", desc: false },
	]);
	const columnVisibility = useItemTableColumnVisibility();

	const isCollectable = (item: AppItem) => collectableIds.has(item.id);

	const toggleCollect = (item: AppItem) => {
		if (readOnly || !isCollectable(item)) return;
		if (collectedIds.includes(item.id)) {
			onUncollect({ itemId: item.id, itemName: item.name });
		} else {
			onCollect({ itemId: item.id, itemName: item.name });
		}
	};

	const table = useReactTable({
		data: items,
		columns: createItemTableColumns({
			collectedIds,
			collectableIds,
			readOnly,
			onToggleCollect: toggleCollect,
			onInfo,
		}),
		state: { sorting, columnVisibility },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	const rows = table.getRowModel().rows;

	const virtualizer = useWindowVirtualizer({
		count: rows.length,
		estimateSize: () => ROW_HEIGHT,
		overscan: 10,
		// Measured from the body rather than the container so the sticky header's
		// height is not counted as part of the first row's offset.
		scrollMargin: bodyRef.current?.offsetTop ?? 0,
	});

	if (rows.length === 0) {
		return <ItemListEmptyState />;
	}

	return (
		<div className={classes.container}>
			<table className={classes.table}>
				<thead className={classes.thead}>
					{table.getHeaderGroups().map((headerGroup) => (
						<ItemTableHeaderRow
							key={headerGroup.id}
							headerGroup={headerGroup}
						/>
					))}
				</thead>
				<tbody
					ref={bodyRef}
					className={classes.tbody}
					style={{ height: virtualizer.getTotalSize() }}
				>
					{virtualizer.getVirtualItems().map((virtualRow) => {
						const row = rows[virtualRow.index];
						if (!row) return null;

						const collectable = isCollectable(row.original);
						const collected =
							collectable && collectedIds.includes(row.original.id);

						return (
							<ItemTableRow
								key={row.id}
								row={row}
								offset={virtualRow.start - virtualizer.options.scrollMargin}
								collected={collected}
								dimmed={collectable && !collected && dimUncollected}
								interactive={!readOnly && collectable}
								onActivate={() => toggleCollect(row.original)}
							/>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};
