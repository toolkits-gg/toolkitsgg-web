import type { GameConfig } from "#/features/game/types.ts";
import { ANCIENTS } from "#/games/slaythespire2/core/item-data/ancients.ts";
import { CARDS } from "#/games/slaythespire2/core/item-data/cards";
import { CHARACTERS } from "#/games/slaythespire2/core/item-data/characters";
import { POTIONS } from "#/games/slaythespire2/core/item-data/potions";
import { RELICS } from "#/games/slaythespire2/core/item-data/relics";
import type { SlayTheSpire2LocalItem } from "#/games/slaythespire2/core/types";
import type {
	SlayTheSpire2ItemCategory,
	SlayTheSpire2UncollectableItemCategory,
} from "@/prisma";

const ITEMS_BY_CATEGORY = {
	ANCIENT: ANCIENTS,
	CARD: CARDS,
	CHARACTER: CHARACTERS,
	POTION: POTIONS,
	RELIC: RELICS,
} satisfies Record<SlayTheSpire2ItemCategory, SlayTheSpire2LocalItem[]>;

const UNCOLLECTABLE_ITEM_CATEGORIES: SlayTheSpire2UncollectableItemCategory[] =
	["ANCIENT"];

const allItems = Object.entries(ITEMS_BY_CATEGORY)
	.flatMap(([, items]): SlayTheSpire2LocalItem[] => items)
	.sort((a, b) => a.name.localeCompare(b.name));

const ALL_SLAYTHESPIRE2_ITEMS = allItems;

const allCategories = Object.keys(
	ITEMS_BY_CATEGORY,
) as SlayTheSpire2ItemCategory[];

const collectableItems = allItems
	/** Skip item categories that cannot be collected */
	.filter((item) => {
		return !UNCOLLECTABLE_ITEM_CATEGORIES.includes(
			item.category as SlayTheSpire2UncollectableItemCategory,
		);
	});

const ITEMS: GameConfig<
	SlayTheSpire2LocalItem,
	SlayTheSpire2ItemCategory
>["ITEMS"] = {
	all: allItems,
	categorized: { ...ITEMS_BY_CATEGORY },
	categories: allCategories,
	uncollectableCategories: [],
	collectable: collectableItems,
};

export { ALL_SLAYTHESPIRE2_ITEMS, ITEMS };
