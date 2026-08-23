import { renderDescriptionVariant } from "#/components/ItemDescription.tsx";
import { toCsv } from "#/features/export/csv";
import { getLinkedItemRefs } from "#/features/game/items/utils";
import type { AppItem } from "#/features/game/types";

type ItemCsvColumn = {
	header: string;
	getValue: (item: AppItem) => string;
};

/** Multi-value cells join on a semicolon so they stay readable inside a quoted CSV field. */
const MULTI_VALUE_SEPARATOR = "; ";

const flattenDescription = (item: AppItem): string =>
	item.description
		.map((line) => renderDescriptionVariant(line, "base"))
		.join(" ")
		.replace(/\s*\n\s*/g, " ")
		.trim();

const BASE_ITEM_CSV_COLUMNS: ItemCsvColumn[] = [
	{ header: "Name", getValue: (item) => item.name },
	{ header: "Category", getValue: (item) => String(item.category) },
	{
		header: "Subcategory",
		getValue: (item) => (item.subcategory ? String(item.subcategory) : ""),
	},
	{ header: "Description", getValue: flattenDescription },
	{
		header: "Searchable Tags",
		getValue: (item) =>
			item.searchableTags?.map(String).join(MULTI_VALUE_SEPARATOR) ?? "",
	},
	{
		header: "Linked Items",
		getValue: (item) =>
			getLinkedItemRefs(item)
				.map((ref) => `${ref.relation}: ${ref.name}`)
				.join(MULTI_VALUE_SEPARATOR),
	},
];

type BuildItemCsvArgs = {
	items: AppItem[];
	collectedIds: string[];
	/** Game-specific columns appended after the shared set. */
	extraColumns?: ItemCsvColumn[];
};

const buildItemCsv = ({
	items,
	collectedIds,
	extraColumns = [],
}: BuildItemCsvArgs): string => {
	const collected = new Set(collectedIds);
	const columns: ItemCsvColumn[] = [
		{
			header: "Collected",
			getValue: (item) => (collected.has(item.id) ? "Yes" : "No"),
		},
		...BASE_ITEM_CSV_COLUMNS,
		...extraColumns,
	];

	return toCsv([
		columns.map((column) => column.header),
		...items.map((item) => columns.map((column) => column.getValue(item))),
	]);
};

export type { BuildItemCsvArgs, ItemCsvColumn };
export { buildItemCsv };
