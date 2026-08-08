import { upperFirst } from "@mantine/hooks";
import type { AppItem } from "#/features/game/types.ts";
import { titleCase } from "#/utils.ts";

type CategoryOption = {
	label: string;
	value: string;
};

type GroupedOption = {
	group: string;
	items: CategoryOption[];
};

/** Yields all linkedItem names for an item. */
const linkedItemNames = function* (
	item: AppItem,
): Generator<string, undefined> {
	if (!item.linkedItems) return;

	for (const values of Object.values(item.linkedItems)) {
		const valuesToProcess = Array.isArray(values) ? values : [values];

		for (const value of valuesToProcess) {
			const name = value?.name;
			if (name) yield name;
		}
	}
};

/** Formats a comma-separated category filter value (or "cat:sub") into a human-readable label. */
export const formatCategoryLabel = (raw: string): string => {
	const selected = raw ? raw.split(",").filter(Boolean) : [];
	if (selected.length === 0) return "";
	if (selected.length === 1) {
		const val = selected[0] ?? "";
		if (val.includes(":")) {
			const [cat, sub] = val.split(":");
			return `${upperFirst(sub ?? "")} ${upperFirst(cat ?? "")}`;
		}
		return upperFirst(val);
	}
	return `${selected.length} selected`;
};

/** Returns true if the item's category (and optional subcategory) matches the filter value. */
export const itemMatchesCategory = (
	item: AppItem,
	filterValue: string,
): boolean => {
	if (filterValue.includes(":")) {
		const [category, subcategory] = filterValue.split(":");
		if (String(item.category) !== category) return false;
		return (
			item.subcategory !== undefined && String(item.subcategory) === subcategory
		);
	}
	return String(item.category) === filterValue;
};
export const getItemSubcategories = (
	items: AppItem[],
): (CategoryOption | GroupedOption)[] => {
	const categoryMap = new Map<string, Set<string>>();

	for (const item of items) {
		const cat = String(item.category);
		if (!categoryMap.has(cat)) {
			categoryMap.set(cat, new Set());
		}

		if (item.subcategory) {
			const subcategoryValue = `${cat}:${String(item.subcategory)}`;
			categoryMap.get(cat)?.add(subcategoryValue);
		}
	}

	const result: (CategoryOption | GroupedOption)[] = [];

	const sortedEntries = Array.from(categoryMap.entries()).sort(([a], [b]) =>
		a.localeCompare(b),
	);

	for (const [category, subcategories] of sortedEntries) {
		if (subcategories.size === 0) {
			result.push({ label: titleCase(category), value: category });
			continue;
		}

		const options: CategoryOption[] = [
			{ label: `All ${titleCase(category)}`, value: category },
		];

		for (const subcategory of Array.from(subcategories).sort()) {
			const [, type] = subcategory.split(":");
			options.push({
				label: `Only ${titleCase(type ?? "")} ${titleCase(category)}`,
				value: subcategory,
			});
		}

		result.push({ group: titleCase(category), items: options });
	}

	return result;
};

/** Finds an item by its name, ignoring case. */
export const findItemByName = <TItem extends AppItem>(
	name: string,
	allItems: TItem[],
): TItem | null =>
	allItems.find((i) => i.name.toLowerCase() === name.toLowerCase()) ?? null;

/** The name of the first linked item, in the order the relationships were authored. */
export const getFirstLinkedItemName = (item: AppItem): string | undefined =>
	linkedItemNames(item).next().value;

/**
 * Resolves linked items for a given item by matching names
 * from the item's linkedItems field against a list of all items.
 */
export const resolveLinkedItems = <TItem extends AppItem>(
	item: TItem,
	allItems: TItem[],
): TItem[] => {
	const results: TItem[] = [];

	for (const name of linkedItemNames(item)) {
		const foundItem = findItemByName(name, allItems);

		if (foundItem && !results.some((r) => r.id === foundItem.id)) {
			results.push(foundItem);
		}
	}

	return results;
};
