import type { GameConfig } from "#/features/game/types.ts";
import { CHARACTERS } from "#/games/clairobscur/core/item-data/characters";
import type { ClairObscurLocalItem } from "#/games/clairobscur/core/types.ts";
import type { ClairObscurItemCategory } from "@/prisma";

const ITEMS_BY_CATEGORY = {
	CHARACTER: CHARACTERS,
	LUMINA: [], // TODO
	PICTO: [], // TODO
	SKILL: [], // TODO
	WEAPON: [], // TODO
} satisfies Record<ClairObscurItemCategory, ClairObscurLocalItem[]>;

const allItems = Object.entries(ITEMS_BY_CATEGORY)
	.flatMap(([, items]): ClairObscurLocalItem[] => items)
	.sort((a, b) => a.name.localeCompare(b.name));

const ALL_CLAIROBSCUR_ITEMS = allItems;

const allCategories = Object.keys(
	ITEMS_BY_CATEGORY,
) as ClairObscurItemCategory[];

// TODO: If uncollectable items or linked items are added,
// TODO: filter them out of collectable items
// TODO: See remnant2/config/items.ts for example of how to do this
const collectableItems = allItems;

const ITEMS: GameConfig<
	ClairObscurLocalItem,
	ClairObscurItemCategory
>["ITEMS"] = {
	all: allItems,
	categorized: { ...ITEMS_BY_CATEGORY },
	categories: allCategories,
	uncollectableCategories: [],
	collectable: collectableItems,
};

export { ALL_CLAIROBSCUR_ITEMS, ITEMS };
