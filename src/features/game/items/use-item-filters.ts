import { parseAsBoolean, useQueryStates } from "nuqs";
import type { ReactNode } from "react";
import type { ActiveFilter } from "#/features/game/items/ItemFilterBar";
import type { AppItem, GameFilterConfig } from "#/features/game/items/types";
import type { AnyGameConfig } from "#/features/game/registry/game-registry";
import {
	dimUncollectedItemsParser,
	showCollectableOnlyParser,
	showCollectedItemsParser,
	showUncollectedItemsParser,
} from "#/features/nuqs/parsers/item-collection.ts";
import { searchParser } from "#/features/nuqs/parsers/search.ts";

const itemLookupParsers = {
	search: searchParser,
	showCollectedItems: showCollectedItemsParser,
	showUncollectedItems: showUncollectedItemsParser,
	dimUncollectedItems: dimUncollectedItemsParser,
	showCollectableOnly: showCollectableOnlyParser,
};

const collectedItemsTabParsers = {
	...itemLookupParsers,
	// Hide uncollected items by default on the Profile collected items tab
	showUncollectedItems: parseAsBoolean.withDefault(false).withOptions({
		shallow: true,
		clearOnDefault: true,
	}),
};

type UniversalParamKey =
	| "search"
	| "showCollectedItems"
	| "showUncollectedItems"
	| "dimUncollectedItems"
	| "showCollectableOnly";

type UseItemFiltersArgs = {
	items: AnyGameConfig["ITEMS"];
	collectedIds: string[];
	gameFilterConfig?: GameFilterConfig;
	isCollectedItemsTab: boolean;
};

type UseItemFiltersResult = {
	search: string;
	showCollectedItems: boolean;
	showUncollectedItems: boolean;
	dimUncollectedItems: boolean;
	showCollectableOnly: boolean;
	setUniversalParam: (
		key: UniversalParamKey,
		value: string | boolean,
	) => Promise<URLSearchParams>;
	clearAllFilters: () => void;
	activeFilters: ActiveFilter[];
	renderGameFilters: ReactNode;
	filteredItems: AppItem[];
	filteredCategories: string[];
};

const useItemFilters = ({
	items,
	collectedIds,
	gameFilterConfig,
	isCollectedItemsTab,
}: UseItemFiltersArgs): UseItemFiltersResult => {
	const [universalParams, setUniversalParams] = useQueryStates(
		isCollectedItemsTab ? collectedItemsTabParsers : itemLookupParsers,
	);
	const {
		search,
		showCollectedItems,
		showUncollectedItems,
		dimUncollectedItems,
		showCollectableOnly,
	} = universalParams;

	const [gameParams, setGameParams] = useQueryStates(
		gameFilterConfig?.parsers ?? {},
	);

	const getActiveGameParams = (): Record<string, string> => {
		if (!gameFilterConfig) return {};
		return Object.fromEntries(
			gameFilterConfig.defs.map((def) => [
				def.key,
				(gameParams as Record<string, string>)[def.key] ?? def.defaultValue,
			]),
		);
	};
	const activeGameParams = getActiveGameParams();

	const setParam = (key: string, value: string | undefined) => {
		return setGameParams({ [key]: value ?? null } as Parameters<
			typeof setGameParams
		>[0]);
	};

	const setUniversalParam = (
		key: UniversalParamKey,
		value: string | boolean,
	): Promise<URLSearchParams> => {
		return setUniversalParams({ [key]: value } as Parameters<
			typeof setUniversalParams
		>[0]);
	};

	const clearAllFilters = () => {
		void setUniversalParams({
			search: "",
			showCollectedItems: true,
			showUncollectedItems: !isCollectedItemsTab,
			dimUncollectedItems: false,
			showCollectableOnly: false,
		});
		if (gameFilterConfig) {
			void setGameParams(
				Object.fromEntries(
					gameFilterConfig.defs.map((def) => [def.key, null]),
				) as Parameters<typeof setGameParams>[0],
			);
		}
	};

	const isUncollectable = (category: string) =>
		items.uncollectableCategories.some(
			(uc) => String(category).toLowerCase() === String(uc).toLowerCase(),
		);

	const getFilteredItems = () => {
		let result = items.all;

		if (search.trim()) {
			const q = search.trim().toLowerCase();
			result = result.filter(
				(item) =>
					item.name.toLowerCase().includes(q) ||
					item.description.some((d) => d.toLowerCase().includes(q)) ||
					item.searchableTags?.some((t) => String(t).toLowerCase().includes(q)),
			);
		}

		if (showCollectableOnly) {
			result = result.filter((item) => !isUncollectable(String(item.category)));
		}

		result = result.filter((item) => {
			const collected = collectedIds.includes(item.id);
			if (collected && !showCollectedItems) return false;
			return !(!collected && !showUncollectedItems);
		});

		if (gameFilterConfig) {
			result = gameFilterConfig.filterItems(result, activeGameParams);
		}

		return result;
	};
	const filteredItems = getFilteredItems();

	const getFilteredCategories = () => {
		const catSet = new Set(filteredItems.map((item) => String(item.category)));
		return items.categories.map((c) => String(c)).filter((c) => catSet.has(c));
	};
	const filteredCategories = getFilteredCategories();

	const getActiveFilters = (): ActiveFilter[] => {
		const filters: ActiveFilter[] = [];

		if (search) {
			filters.push({
				key: "search",
				label: "Search",
				value: search,
				onRemove: () => setUniversalParam("search", ""),
			});
		}
		if (!showCollectedItems) {
			filters.push({
				key: "showCollectedItems",
				label: "Collected",
				value: "Hidden",
				onRemove: () => setUniversalParam("showCollectedItems", true),
			});
		}
		if (isCollectedItemsTab) {
			if (showUncollectedItems) {
				filters.push({
					key: "showUncollectedItems",
					label: "Uncollected",
					value: "Visible",
					onRemove: () => setUniversalParam("showUncollectedItems", false),
				});
			}
		} else if (!showUncollectedItems) {
			filters.push({
				key: "showUncollectedItems",
				label: "Uncollected",
				value: "Hidden",
				onRemove: () => setUniversalParam("showUncollectedItems", true),
			});
		}
		if (dimUncollectedItems) {
			filters.push({
				key: "dimUncollectedItems",
				label: "Uncollected",
				value: "Dimmed",
				onRemove: () => setUniversalParam("dimUncollectedItems", false),
			});
		}
		if (showCollectableOnly) {
			filters.push({
				key: "showCollectableOnly",
				label: "Collectable only",
				value: "Yes",
				onRemove: () => setUniversalParam("showCollectableOnly", false),
			});
		}

		if (gameFilterConfig) {
			for (const def of gameFilterConfig.defs) {
				const raw = activeGameParams[def.key] ?? def.defaultValue;
				if (raw && raw !== def.defaultValue) {
					filters.push({
						key: def.key,
						label: def.label,
						value: def.formatValue ? def.formatValue(raw) : raw,
						onRemove: () => setParam(def.key, undefined),
					});
				}
			}
		}

		return filters;
	};
	const activeFilters = getActiveFilters();

	const renderGameFilters =
		gameFilterConfig?.renderControls(
			activeGameParams,
			setParam,
			filteredItems,
		) ?? null;

	return {
		search,
		showCollectedItems,
		showUncollectedItems,
		dimUncollectedItems,
		showCollectableOnly,
		setUniversalParam,
		clearAllFilters,
		activeFilters,
		renderGameFilters,
		filteredItems,
		filteredCategories,
	};
};

export type { UniversalParamKey, UseItemFiltersArgs, UseItemFiltersResult };
export { useItemFilters };
