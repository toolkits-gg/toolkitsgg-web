import { ActionIcon, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import type { Column, ColumnDef } from "@tanstack/react-table";
import { LuCheck, LuMaximize, LuPlus, LuX } from "react-icons/lu";
import { AppGameImage } from "#/components/AppGameImage.tsx";
import {
	AppItemDescription,
	renderDescriptionVariant,
} from "#/components/AppItemDescription.tsx";
import { isItemCollectable } from "#/components/pages/item-list/is-item-collectable.ts";
import type { AppItem } from "#/features/game/types.ts";
import classes from "../AppItemVirtualTable.module.css";

/**
 * Rows are flex containers rather than real table cells so the virtualizer can
 * absolutely position them, so each column carries its own flex sizing.
 */
type ColumnMeta = { grow: number };

const columnStyle = (column: Column<AppItem>, size: number) => {
	const { grow } = (column.columnDef.meta as ColumnMeta | undefined) ?? {
		grow: 0,
	};
	return {
		flex: grow > 0 ? `${grow} 1 ${size}px` : `0 0 ${size}px`,
		minWidth: 0,
	};
};

type ItemTableColumnsOptions = {
	collectedIds: string[];
	uncollectableCategories: string[];
	readOnly: boolean;
	onToggleCollect: (item: AppItem) => void;
	onInfo: (item: AppItem) => void;
};

type CollectCellProps = {
	item: AppItem;
	collected: boolean;
	collectable: boolean;
	readOnly: boolean;
	onToggleCollect: (item: AppItem) => void;
};

const CollectCell = ({
	item,
	collected,
	collectable,
	readOnly,
	onToggleCollect,
}: CollectCellProps) => {
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
			onClick={() => onToggleCollect(item)}
		>
			{collected ? <LuCheck size={14} /> : <LuPlus size={14} />}
		</ActionIcon>
	);
};

const DescriptionCell = ({ item }: { item: AppItem }) => (
	<AppItemDescription
		description={item.description}
		singleLine
		size="xs"
		c="dimmed"
		truncate="end"
		title={item.description
			.map((line) => renderDescriptionVariant(line, "base"))
			.join(" ")
			.replace(/\n/g, " ")}
	/>
);

const createItemTableColumns = ({
	collectedIds,
	uncollectableCategories,
	readOnly,
	onToggleCollect,
	onInfo,
}: ItemTableColumnsOptions): ColumnDef<AppItem>[] => [
	{
		id: "collected",
		header: "",
		size: 44,
		meta: { grow: 0 } satisfies ColumnMeta,
		accessorFn: (item) => collectedIds.includes(item.id),
		cell: ({ row }) => (
			<CollectCell
				item={row.original}
				collected={collectedIds.includes(row.original.id)}
				collectable={isItemCollectable(
					row.original.category,
					uncollectableCategories,
				)}
				readOnly={readOnly}
				onToggleCollect={onToggleCollect}
			/>
		),
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
		cell: ({ row }) => <DescriptionCell item={row.original} />,
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

const useItemTableColumnVisibility = () => {
	const isAtLeastXs = useMediaQuery("(min-width: 36em)", true, {
		getInitialValueInEffect: false,
	});
	const isAtLeastSm = useMediaQuery("(min-width: 48em)", true, {
		getInitialValueInEffect: false,
	});
	const isAtLeastMd = useMediaQuery("(min-width: 62em)", true, {
		getInitialValueInEffect: false,
	});

	return {
		image: isAtLeastXs,
		subcategory: isAtLeastMd,
		description: isAtLeastSm,
	};
};

export type { ColumnMeta, ItemTableColumnsOptions };
export { columnStyle, createItemTableColumns, useItemTableColumnVisibility };
