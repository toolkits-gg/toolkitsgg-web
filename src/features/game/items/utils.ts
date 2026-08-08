import { upperFirst } from "@mantine/hooks";
import type { AppItem } from "#/features/game/types";
import { titleCase } from "#/utils";

type CategoryOption = {
	label: string;
	value: string;
};

type GroupedOption = {
	group: string;
	items: CategoryOption[];
};

/** A linkedItems entry paired with the relationship it was authored under. */
type LinkedItemRef = {
	relation: string;
	name: string;
};

/** Maps a game's linkedItems relationship names to the item category they point at. */
type LinkedItemCategories = Record<string, string>;

const linkedItemRefs = function* (
	item: AppItem,
): Generator<LinkedItemRef, undefined> {
	if (!item.linkedItems) return;

	for (const [relation, values] of Object.entries(item.linkedItems)) {
		const valuesToProcess = Array.isArray(values) ? values : [values];

		for (const value of valuesToProcess) {
			const name = value?.name;
			if (name) yield { relation, name };
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

/** Yields every linked item reference on an item, with its relationship name. */
export const getLinkedItemRefs = (item: AppItem): LinkedItemRef[] =>
	Array.from(linkedItemRefs(item));

/**
 * Finds the item a linked item reference points at, ignoring case.
 * The lookup is scoped to the category the relationship declares, since item
 * names are only unique within a category.
 */
export const findLinkedItem = <TItem extends AppItem>(
	ref: LinkedItemRef,
	allItems: TItem[],
	categories: LinkedItemCategories,
): TItem | null => {
	const category = categories[ref.relation];
	if (!category) return null;

	const name = ref.name.toLowerCase();

	return (
		allItems.find(
			(i) => String(i.category) === category && i.name.toLowerCase() === name,
		) ?? null
	);
};

/** The first linked item reference, in the order the relationships were authored. */
export const getFirstLinkedItemRef = (
	item: AppItem,
): LinkedItemRef | undefined => linkedItemRefs(item).next().value;

/**
 * Resolves linked items for a given item by matching the names
 * from the item's linkedItems field against a list of all items.
 */
export const resolveLinkedItems = <TItem extends AppItem>(
	item: TItem,
	allItems: TItem[],
	categories: LinkedItemCategories,
): TItem[] => {
	const results: TItem[] = [];

	for (const ref of linkedItemRefs(item)) {
		const foundItem = findLinkedItem(ref, allItems, categories);

		if (foundItem && !results.some((r) => r.id === foundItem.id)) {
			results.push(foundItem);
		}
	}

	return results;
};

export type { LinkedItemCategories, LinkedItemRef };
