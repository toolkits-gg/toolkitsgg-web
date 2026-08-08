import { MultiSelect, SimpleGrid, Stack, Text } from "@mantine/core";
import { parseAsString } from "nuqs";
import type { ReactNode } from "react";
import { ItemListPage } from "#/components/pages/ItemList";
import {
	TriStateFilter,
	type TriStateFilterValue,
} from "#/components/TriStateFilter";
import {
	formatCategoryLabel,
	getItemSubcategories,
	itemMatchesCategory,
	resolveLinkedItems,
} from "#/features/game/items/utils";
import type {
	AppItem,
	GameFilterConfig,
	GamePages,
} from "#/features/game/types";
import { REMNANT2_DLC_LABELS } from "#/games/remnant2/core/game-config/dlc-labels";
import { REMNANT2_ITEM_CSV_COLUMNS } from "#/games/remnant2/core/game-config/item-csv-columns";
import { ITEMS } from "#/games/remnant2/core/game-config/items";
import { LINKED_ITEM_CATEGORIES } from "#/games/remnant2/core/game-config/linked-item-categories";
import { resolveRemnant2PrimaryLinkedItem } from "#/games/remnant2/core/game-config/linked-items";
import { remnant2CollectedItemsData } from "#/games/remnant2/data/collected-items/use-collected-items";
import type { Remnant2DLC } from "@/prisma";

const parseDlc = (raw: string): TriStateFilterValue => {
	if (!raw) return {};
	try {
		return JSON.parse(raw) as TriStateFilterValue;
	} catch {
		return {};
	}
};

const formatDlcLabel = (raw: string): string => {
	const dlc = parseDlc(raw);
	const included = Object.entries(dlc)
		.filter(([, s]) => s === "include")
		.map(([k]) => REMNANT2_DLC_LABELS[k as Remnant2DLC] ?? k);
	const excluded = Object.entries(dlc)
		.filter(([, s]) => s === "exclude")
		.map(([k]) => REMNANT2_DLC_LABELS[k as Remnant2DLC] ?? k);
	const parts: string[] = [];
	if (included.length > 0) parts.push(`+${included.join(", ")}`);
	if (excluded.length > 0) parts.push(`-${excluded.join(", ")}`);
	return parts.join(" / ");
};

const remnant2ItemFilterConfig: GameFilterConfig = {
	label: "Remnant 2 Filters",
	parsers: {
		category: parseAsString.withDefault(""),
		dlc: parseAsString.withDefault(""),
	},
	defs: [
		{
			key: "category",
			label: "Categories",
			defaultValue: "",
			formatValue: formatCategoryLabel,
		},
		{
			key: "dlc",
			label: "DLC",
			defaultValue: "",
			formatValue: formatDlcLabel,
		},
	],
	renderControls: (
		params: Record<string, string>,
		setParam: (key: string, value: string | undefined) => void,
		_filteredItems: AppItem[],
	): ReactNode => {
		const categoryRaw = params.category ?? "";
		const selectedCategories = categoryRaw ? categoryRaw.split(",") : [];
		const dlcFilter = parseDlc(params.dlc ?? "");
		const groupedSubcategories = getItemSubcategories(ITEMS.all);

		return (
			<Stack gap="xs">
				<Text fz="sm" fw={500} c="dimmed">
					Remnant 2 Filters
				</Text>
				<SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
					<MultiSelect
						label="Categories"
						placeholder="Select categories"
						searchable
						nothingFoundMessage="No categories found"
						data={groupedSubcategories}
						value={selectedCategories}
						onChange={(val) =>
							setParam("category", val.length > 0 ? val.join(",") : undefined)
						}
					/>
					<TriStateFilter
						label="DLC"
						options={REMNANT2_DLC_LABELS}
						value={dlcFilter}
						onChange={(val) =>
							setParam(
								"dlc",
								Object.keys(val).length > 0 ? JSON.stringify(val) : undefined,
							)
						}
						placeholder="Filter by DLC"
					/>
				</SimpleGrid>
			</Stack>
		);
	},
	filterItems: (
		items: AppItem[],
		params: Record<string, string>,
	): AppItem[] => {
		const categoryRaw = params.category ?? "";
		const selectedCategories = categoryRaw
			? categoryRaw.split(",").filter(Boolean)
			: [];
		const dlcFilter = parseDlc(params.dlc ?? "");
		const hasDlcFilters = Object.keys(dlcFilter).length > 0;

		let result = items;

		if (selectedCategories.length > 0) {
			result = result.filter((item) =>
				selectedCategories.some((f) => itemMatchesCategory(item, f)),
			);
		}

		if (hasDlcFilters) {
			const includedDlcs = Object.entries(dlcFilter)
				.filter(([, s]) => s === "include")
				.map(([k]) => k);
			const excludedDlcs = Object.entries(dlcFilter)
				.filter(([, s]) => s === "exclude")
				.map(([k]) => k);

			result = result.filter((item) => {
				const itemDlc = (item as { dlc?: string }).dlc ?? "";
				if (excludedDlcs.includes(itemDlc)) return false;
				return !(includedDlcs.length > 0 && !includedDlcs.includes(itemDlc));
			});
		}

		return result;
	},
};

export const PAGES: GamePages = {
	renderItemLookup: () => (
		<ItemListPage
			items={ITEMS}
			resolveLinkedItems={(item) =>
				resolveLinkedItems(item, ITEMS.all, LINKED_ITEM_CATEGORIES)
			}
			resolvePrimaryLinkedItem={resolveRemnant2PrimaryLinkedItem}
			data={remnant2CollectedItemsData}
			gameFilterConfig={remnant2ItemFilterConfig}
			itemCsvColumns={REMNANT2_ITEM_CSV_COLUMNS}
		/>
	),
	renderCollectedItems: ({ mode }) => (
		<ItemListPage
			items={ITEMS}
			resolveLinkedItems={(item) =>
				resolveLinkedItems(item, ITEMS.all, LINKED_ITEM_CATEGORIES)
			}
			resolvePrimaryLinkedItem={resolveRemnant2PrimaryLinkedItem}
			data={remnant2CollectedItemsData}
			gameFilterConfig={remnant2ItemFilterConfig}
			itemCsvColumns={REMNANT2_ITEM_CSV_COLUMNS}
			viewMode={mode}
		/>
	),
};
