import { ActionIcon, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import clsx from "clsx";
import { useRef, useState } from "react";
import {
	LuCheck,
	LuChevronDown,
	LuChevronUp,
	LuMaximize,
	LuPlus,
	LuX,
} from "react-icons/lu";
import { AppGameImage } from "#/components/AppGameImage.tsx";
import {
	AppItemDescription,
	renderDescriptionVariant,
} from "#/components/AppItemDescription.tsx";
import { ItemListEmptyState } from "#/components/pages/item-list/ItemListEmptyState.tsx";
import { isItemCollectable } from "#/components/pages/item-list/is-item-collectable.ts";
import type { CollectItemInput } from "#/features/game/data/types.ts";
import type { AppItem } from "#/features/game/types.ts";
import classes from "./AppItemVirtualTable.module.css";

const ROW_HEIGHT = 40;

/**
 * Rows are flex containers rather than real table cells so the virtualizer can
 * absolutely position them, so each column carries its own flex sizing.
 */
type ColumnMeta = { grow: number };

const columnStyle = (size: number, grow: number) => ({
	flex: grow > 0 ? `${grow} 1 ${size}px` : `0 0 ${size}px`,
	minWidth: 0,
});

export type AppItemVirtualTableProps = {
	items: AppItem[];
	uncollectableCategories: string[];
	collectedIds: string[];
	dimUncollected: boolean;
	onCollect: ({ itemId, itemName }: CollectItemInput) => void;
	onUncollect: ({ itemId, itemName }: CollectItemInput) => void;
	onInfo: (item: AppItem) => void;
	readOnly?: boolean;
};

export const AppItemVirtualTable = ({
	items,
	uncollectableCategories,
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

	const isAtLeastXs = useMediaQuery("(min-width: 36em)", true, {
		getInitialValueInEffect: false,
	});
	const isAtLeastSm = useMediaQuery("(min-width: 48em)", true, {
		getInitialValueInEffect: false,
	});
	const isAtLeastMd = useMediaQuery("(min-width: 62em)", true, {
		getInitialValueInEffect: false,
	});

	const isCollectable = (item: AppItem) =>
		isItemCollectable(item.category, uncollectableCategories);

	const toggleCollect = (item: AppItem) => {
		if (readOnly || !isCollectable(item)) return;
		if (collectedIds.includes(item.id)) {
			onUncollect({ itemId: item.id, itemName: item.name });
		} else {
			onCollect({ itemId: item.id, itemName: item.name });
		}
	};

	const columns: ColumnDef<AppItem>[] = [
		{
			id: "collected",
			header: "",
			size: 44,
			meta: { grow: 0 } satisfies ColumnMeta,
			accessorFn: (item) => collectedIds.includes(item.id),
			cell: ({ row }) => {
				const item = row.original;
				const collectable = isItemCollectable(
					item.category,
					uncollectableCategories,
				);
				const collected = collectedIds.includes(item.id);

				if (!collectable) {
					return (
						<ActionIcon
							size={24}
							radius="sm"
							variant="transparent"
							disabled
							title="Not collectable"
							className={classes.notCollectable}
						>
							<LuX size={14} />
						</ActionIcon>
					);
				}

				if (readOnly) {
					return collected ? (
						<LuCheck size={16} className={classes.readOnlyCheck} />
					) : null;
				}

				return (
					<ActionIcon
						size={24}
						radius="sm"
						variant={collected ? "filled" : "subtle"}
						color={collected ? "green" : "gray"}
						aria-label={collected ? "Uncollect item" : "Collect item"}
						title={collected ? "Remove from collected" : "Mark as collected"}
						onClick={() => toggleCollect(item)}
					>
						{collected ? <LuCheck size={14} /> : <LuPlus size={14} />}
					</ActionIcon>
				);
			},
		},
		{
			id: "image",
			header: "",
			size: 40,
			meta: { grow: 0 } satisfies ColumnMeta,
			enableSorting: false,
			cell: ({ row }) =>
				row.original.imageUrl ? (
					<AppGameImage
						src={row.original.imageUrl}
						size="xs"
						alt={`Image of ${row.original.name}`}
						h={28}
						w={28}
						fit="contain"
					/>
				) : null,
		},
		{
			id: "name",
			header: "Name",
			size: 200,
			meta: { grow: 2 } satisfies ColumnMeta,
			accessorFn: (item) => item.name,
			cell: ({ row }) => (
				<Text size="sm" fw={600} c="primary" truncate="end">
					{row.original.name}
				</Text>
			),
		},
		{
			id: "category",
			header: "Category",
			size: 130,
			meta: { grow: 1 } satisfies ColumnMeta,
			accessorFn: (item) => String(item.category),
			cell: ({ row }) => (
				<Text size="xs" fw={600} tt="uppercase" c="dimmed" truncate="end">
					{String(row.original.category)}
				</Text>
			),
		},
		{
			id: "subcategory",
			header: "Subcategory",
			size: 130,
			meta: { grow: 1 } satisfies ColumnMeta,
			accessorFn: (item) => (item.subcategory ? String(item.subcategory) : ""),
			cell: ({ row }) => (
				<Text size="xs" tt="uppercase" c="dimmed" truncate="end">
					{row.original.subcategory ? String(row.original.subcategory) : "-"}
				</Text>
			),
		},
		{
			id: "description",
			header: "Description",
			size: 260,
			meta: { grow: 3 } satisfies ColumnMeta,
			enableSorting: false,
			cell: ({ row }) => (
				<AppItemDescription
					description={row.original.description}
					singleLine
					size="xs"
					c="dimmed"
					truncate="end"
					title={row.original.description
						.map((line) => renderDescriptionVariant(line, "base"))
						.join(" ")
						.replace(/\n/g, " ")}
				/>
			),
		},
		{
			id: "actions",
			header: "",
			size: 44,
			meta: { grow: 0 } satisfies ColumnMeta,
			enableSorting: false,
			cell: ({ row }) => (
				<ActionIcon
					size={24}
					radius="sm"
					variant="subtle"
					color="gray"
					aria-label="Item info"
					title="View details"
					onClick={() => onInfo(row.original)}
				>
					<LuMaximize size={14} />
				</ActionIcon>
			),
		},
	];

	const table = useReactTable({
		data: items,
		columns,
		state: {
			sorting,
			columnVisibility: {
				image: isAtLeastXs,
				subcategory: isAtLeastMd,
				description: isAtLeastSm,
			},
		},
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
						<tr key={headerGroup.id} className={classes.headerRow}>
							{headerGroup.headers.map((header) => {
								const meta = header.column.columnDef.meta as
									| ColumnMeta
									| undefined;
								const sortable = header.column.getCanSort();
								const sorted = header.column.getIsSorted();

								return (
									<th
										key={header.id}
										className={clsx(classes.th, {
											[classes.sortable]: sortable,
										})}
										style={columnStyle(header.getSize(), meta?.grow ?? 0)}
										onClick={
											sortable
												? header.column.getToggleSortingHandler()
												: undefined
										}
										aria-sort={
											sorted === "asc"
												? "ascending"
												: sorted === "desc"
													? "descending"
													: "none"
										}
									>
										<span className={classes.thLabel}>
											{flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
										</span>
										{sorted === "asc" && <LuChevronUp size={12} />}
										{sorted === "desc" && <LuChevronDown size={12} />}
									</th>
								);
							})}
						</tr>
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

						const item = row.original;
						const collectable = isCollectable(item);
						const collected = collectedIds.includes(item.id);
						const interactive = !readOnly && collectable;

						return (
							<tr
								key={row.id}
								className={clsx(classes.row, {
									[classes.collected]: collected && collectable,
									[classes.dimmed]: !collected && dimUncollected && collectable,
									[classes.interactive]: interactive,
								})}
								style={{
									height: ROW_HEIGHT,
									transform: `translateY(${
										virtualRow.start - virtualizer.options.scrollMargin
									}px)`,
								}}
								tabIndex={interactive ? 0 : undefined}
								onClick={() => toggleCollect(item)}
								onKeyDown={(event) => {
									if (!interactive) return;
									if (event.key === "Enter" || event.key === " ") {
										event.preventDefault();
										toggleCollect(item);
									}
								}}
							>
								{row.getVisibleCells().map((cell) => {
									const meta = cell.column.columnDef.meta as
										| ColumnMeta
										| undefined;
									const stopsPropagation =
										cell.column.id === "collected" ||
										cell.column.id === "actions";

									return (
										// biome-ignore lint/a11y/useKeyWithClickEvents: the row already handles keyboard activation; this only stops the cell's buttons from double-firing
										<td
											key={cell.id}
											className={classes.td}
											style={columnStyle(
												cell.column.getSize(),
												meta?.grow ?? 0,
											)}
											onClick={
												stopsPropagation
													? (event) => event.stopPropagation()
													: undefined
											}
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</td>
									);
								})}
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};
