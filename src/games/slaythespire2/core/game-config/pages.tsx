import { MultiSelect, Stack, Text } from "@mantine/core";
import { parseAsString } from "nuqs";
import type { ReactNode } from "react";
import { BuildCreatePage } from "#/components/pages/BuildCreate.tsx";
import { BuildEditPage } from "#/components/pages/BuildEdit.tsx";
import { BuildViewPage } from "#/components/pages/BuildView.tsx";
import { ItemListPage } from "#/components/pages/ItemList.tsx";
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
import { ITEMS } from "#/games/slaythespire2/core/game-config/items";
import { slayTheSpire2CollectedItemsData } from "#/games/slaythespire2/data/collected-items";

const slayTheSpire2FilterConfig: GameFilterConfig = {
	label: "Slay the Spire 2 Filters",
	parsers: {
		category: parseAsString.withDefault(""),
	},
	defs: [
		{
			key: "category",
			label: "Categories",
			defaultValue: "",

			formatValue: formatCategoryLabel,
		},
	],
	renderControls: (
		params: Record<string, string>,
		setParam: (key: string, value: string | undefined) => void,
		_filteredItems: AppItem[],
	): ReactNode => {
		const categoryRaw = params.category ?? "";
		const selectedCategories = categoryRaw ? categoryRaw.split(",") : [];
		const groupedSubcategories = getItemSubcategories(ITEMS.all);

		return (
			<Stack gap="xs">
				<Text fz="sm" fw={500} c="dimmed">
					Slay the Spire 2 Filters
				</Text>
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

		if (selectedCategories.length === 0) return items;

		return items.filter((item) =>
			selectedCategories.some((f) => itemMatchesCategory(item, f)),
		);
	},
};

const PAGES: GamePages = {
	renderItemLookup: () => (
		<ItemListPage
			items={ITEMS}
			resolveLinkedItems={(item) => resolveLinkedItems(item, ITEMS.all)}
			data={slayTheSpire2CollectedItemsData}
			gameFilterConfig={slayTheSpire2FilterConfig}
		/>
	),
	renderCollectedItems: ({ mode }) => (
		<ItemListPage
			items={ITEMS}
			resolveLinkedItems={(item) => resolveLinkedItems(item, ITEMS.all)}
			data={slayTheSpire2CollectedItemsData}
			gameFilterConfig={slayTheSpire2FilterConfig}
			viewMode={mode}
		/>
	),
	renderCreateBuild: () => <BuildCreatePage />,
	renderViewBuild: () => <BuildViewPage />,
	renderEditBuild: () => <BuildEditPage />,
};

export { PAGES };
