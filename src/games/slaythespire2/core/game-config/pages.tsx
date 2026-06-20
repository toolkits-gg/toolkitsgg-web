import { MultiSelect, Stack, Text } from "@mantine/core";
import { parseAsString } from "nuqs";
import type { ReactNode } from "react";
import { AppItemPage } from "#/features/game/items/AppItemPage";
import type { AppItem, GameFilterConfig } from "#/features/game/items/types";
import {
	formatCategoryLabel,
	getItemSubcategories,
	itemMatchesCategory,
	resolveLinkedItems,
} from "#/features/game/items/utils";
import type { GamePages } from "#/features/game/types.ts";
import { ITEMS } from "#/games/slaythespire2/core/game-config/items";
import { slayTheSpire2CollectedItemsDal } from "#/games/slaythespire2/dal/collected-items";

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
			serialize: (v) => v || undefined,
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
		<AppItemPage
			items={ITEMS}
			resolveLinkedItems={(item) => resolveLinkedItems(item, ITEMS.all)}
			dal={slayTheSpire2CollectedItemsDal}
			gameFilterConfig={slayTheSpire2FilterConfig}
		/>
	),
	renderCollectedItems: ({ mode }) => (
		<AppItemPage
			items={ITEMS}
			resolveLinkedItems={(item) => resolveLinkedItems(item, ITEMS.all)}
			dal={slayTheSpire2CollectedItemsDal}
			gameFilterConfig={slayTheSpire2FilterConfig}
			viewMode={mode}
		/>
	),
};

export { PAGES };
