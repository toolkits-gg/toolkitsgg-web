import { MultiSelect, SimpleGrid, Stack, Text } from "@mantine/core";
import { parseAsString } from "nuqs";
import type { ReactNode } from "react";
import { BuildCreatePage } from "#/components/pages/BuildCreate.tsx";
import { BuildEditPage } from "#/components/pages/BuildEdit.tsx";
import { BuildViewPage } from "#/components/pages/BuildView.tsx";
import { CreatedBuildsPage } from "#/components/pages/created-builds/CreatedBuilds.tsx";
import { ItemListPage } from "#/components/pages/ItemList.tsx";
import {
	TriStateFilter,
	type TriStateFilterValue,
} from "#/components/TriStateFilter.tsx";
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
} from "#/features/game/types.ts";
import { ITEMS } from "#/games/remnant2/core/game-config/items";
import { remnant2CollectedItemsData } from "#/games/remnant2/data/collected-items";
import { remnant2CreatedBuildsData } from "#/games/remnant2/data/created-builds";
import type { Remnant2DLC } from "@/prisma";

const REMNANT2_DLC_LABELS: Record<Remnant2DLC, string> = {
	BASE: "Base Game",
	DLC1: "The Awakened King",
	DLC2: "The Forgotten Kingdom",
	DLC3: "The Dark Horizon",
};

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
			resolveLinkedItems={(item) => resolveLinkedItems(item, ITEMS.all)}
			data={remnant2CollectedItemsData}
			gameFilterConfig={remnant2ItemFilterConfig}
		/>
	),
	renderCollectedItems: ({ mode }) => (
		<ItemListPage
			items={ITEMS}
			resolveLinkedItems={(item) => resolveLinkedItems(item, ITEMS.all)}
			data={remnant2CollectedItemsData}
			gameFilterConfig={remnant2ItemFilterConfig}
			viewMode={mode}
		/>
	),
	renderCreatedBuilds: ({ mode }) => (
		<CreatedBuildsPage data={remnant2CreatedBuildsData} viewMode={mode} />
	),
	renderCreateBuild: () => <BuildCreatePage />,
	renderEditBuild: () => <BuildEditPage />,
	renderViewBuild: () => <BuildViewPage />,
};
