import type { GameConfig } from "#/features/game/core/types";
import { AMULETS } from "#/games/remnant2/core/item-data/amulets";
import { ARCHETYPES } from "#/games/remnant2/core/item-data/archetypes";
import { ARMORS } from "#/games/remnant2/core/item-data/armors";
import { CONCOCTIONS } from "#/games/remnant2/core/item-data/concoctions";
import { CONSUMABLES } from "#/games/remnant2/core/item-data/consumables";
import { FUSIONS } from "#/games/remnant2/core/item-data/fusions";
import { MODS } from "#/games/remnant2/core/item-data/mods";
import { MUTATORS } from "#/games/remnant2/core/item-data/mutators";
import { PERKS } from "#/games/remnant2/core/item-data/perks";
import { PRISMS } from "#/games/remnant2/core/item-data/prisms";
import { PYLONS } from "#/games/remnant2/core/item-data/pylons";
import {
	RELIC_FRAGMENTS,
	type Remnant2RelicFragmentItem,
} from "#/games/remnant2/core/item-data/relic-fragments";
import { RELICS } from "#/games/remnant2/core/item-data/relics";
import { RINGS } from "#/games/remnant2/core/item-data/rings";
import { SKILLS } from "#/games/remnant2/core/item-data/skills";
import { TRAITS } from "#/games/remnant2/core/item-data/traits";
import { WEAPONS } from "#/games/remnant2/core/item-data/weapons";
import type { Remnant2LocalItem } from "#/games/remnant2/core/types";
import type {
	Remnant2ItemCategory,
	Remnant2UncollectableItemCategory,
} from "@/prisma";

const ITEMS_BY_CATEGORY = {
	AMULET: AMULETS,
	ARCHETYPE: ARCHETYPES,
	ARMOR: ARMORS,
	HELM: ARMORS.filter((item) => item.category === "HELM"),
	GLOVES: ARMORS.filter((item) => item.category === "GLOVES"),
	LEGS: ARMORS.filter((item) => item.category === "LEGS"),
	TORSO: ARMORS.filter((item) => item.category === "TORSO"),
	CONCOCTION: CONCOCTIONS,
	CONSUMABLE: CONSUMABLES,
	FUSION: FUSIONS,
	MOD: MODS,
	MUTATOR: MUTATORS,
	PERK: PERKS,
	PRISM: PRISMS,
	PYLON: PYLONS,
	RELIC_FRAGMENT: RELIC_FRAGMENTS,
	RELIC: RELICS,
	RING: RINGS,
	SKILL: SKILLS,
	TRAIT: TRAITS,
	WEAPON: WEAPONS,
} satisfies Record<Remnant2ItemCategory, Remnant2LocalItem[]>;

const UNCOLLECTABLE_ITEM_CATEGORIES: Remnant2UncollectableItemCategory[] = [
	"SKILL",
	"PERK",
	"FUSION",
	"PYLON",
];

/**
 * Remove ARMOR pieces since they are split into multiple categories
 * (HELM, GLOVES, LEGS, TORSO)
 */
const allItems = Object.entries(ITEMS_BY_CATEGORY)
	.filter(([category]) => category !== "ARMOR")
	.flatMap(([, items]) => items)
	.sort((a, b) => a.name.localeCompare(b.name));

const ALL_REMNANT2_ITEMS = allItems;

const allCategories = Object.keys(ITEMS_BY_CATEGORY) as Remnant2ItemCategory[];

const collectableItems = allItems
	/** Skip item categories that cannot be collected */
	.filter((item) => {
		return !UNCOLLECTABLE_ITEM_CATEGORIES.includes(
			item.category as Remnant2UncollectableItemCategory,
		);
	})
	/** Remove mods that have linked guns */
	.filter((item) => {
		if (item.category !== "MOD") return true;
		return item.linkedItems?.weapon === undefined;
	})
	/** Remove legendary relic fragments */
	.filter((item) => {
		if (!item) return true;
		if (item.category !== "RELIC_FRAGMENT") return true;
		return (item as Remnant2RelicFragmentItem).color !== "legendary";
	});

const ITEMS: GameConfig<Remnant2LocalItem, Remnant2ItemCategory>["ITEMS"] = {
	all: allItems,
	categorized: { ...ITEMS_BY_CATEGORY },
	categories: allCategories,
	uncollectableCategories: UNCOLLECTABLE_ITEM_CATEGORIES,
	collectable: collectableItems,
};

export { ALL_REMNANT2_ITEMS, ITEMS };
