import type { AppItem } from "#/features/game/items/types";
import type { Remnant2AmuletItem } from "#/games/remnant2/core/item-data/amulets";
import type { Remnant2ArchetypeItem } from "#/games/remnant2/core/item-data/archetypes";
import type { Remnant2ArmorItem } from "#/games/remnant2/core/item-data/armors";
import type { Remnant2ConcoctionItem } from "#/games/remnant2/core/item-data/concoctions";
import type { Remnant2ConsumableItem } from "#/games/remnant2/core/item-data/consumables";
import type { Remnant2FusionItem } from "#/games/remnant2/core/item-data/fusions";
import type {
	BiomeNameForWorld,
	Injectable,
} from "#/games/remnant2/core/item-data/locations/biomes";
import type { LabyrinthDungeon } from "#/games/remnant2/core/item-data/locations/labyrinth";
import type { LosomnDungeon } from "#/games/remnant2/core/item-data/locations/losomn";
import type { NErudDungeon } from "#/games/remnant2/core/item-data/locations/nerud";
import type { RootEarthDungeon } from "#/games/remnant2/core/item-data/locations/root-earth";
import type { WorldLocation } from "#/games/remnant2/core/item-data/locations/worlds";
import type { YaeshaDungeon } from "#/games/remnant2/core/item-data/locations/yaesha";
import type { Remnant2ModItem } from "#/games/remnant2/core/item-data/mods";
import type { Remnant2MutatorItem } from "#/games/remnant2/core/item-data/mutators";
import type { Remnant2PerkItem } from "#/games/remnant2/core/item-data/perks";
import type { Remnant2PrismItem } from "#/games/remnant2/core/item-data/prisms";
import type { Remnant2PylonItem } from "#/games/remnant2/core/item-data/pylons";
import type { Remnant2RelicFragmentItem } from "#/games/remnant2/core/item-data/relic-fragments";
import type { Remnant2RelicItem } from "#/games/remnant2/core/item-data/relics";
import type { Remnant2RingItem } from "#/games/remnant2/core/item-data/rings";
import type { Remnant2SkillItem } from "#/games/remnant2/core/item-data/skills";
import type { COMMUNITY_ITEM_TAGS } from "#/games/remnant2/core/item-data/tags/community-item-tags";
import type { INLINE_ITEM_TAGS } from "#/games/remnant2/core/item-data/tags/inline-item-tags";
import type { SEARCHABLE_ITEM_TAGS } from "#/games/remnant2/core/item-data/tags/searchable-item-tags";
import type { Remnant2TraitItem } from "#/games/remnant2/core/item-data/traits";
import type { Remnant2WeaponItem } from "#/games/remnant2/core/item-data/weapons";
import type { Remnant2DLC, Remnant2ItemCategory } from "@/prisma";

/**
 * A step modifier is a flat increase per point in the trait
 * e.g. 1 point in Vigor gives +3 health, 2 points gives +6 health, etc.
 *
 * A percentage modifier is a percentage increase based on your base stat
 * e.g. 1 point in Vigor gives +3% health, 2 points gives +6% health, etc.
 */
type ItemModifiers = {
	accuracy: number;
	ammo: number;
	armor: number;
	armorStepPercentage: number;
	armorPercentage: number;
	crit: number;
	damage: number;
	elementalResistanceStep: number;
	health: number;
	healthCap: number;
	healthPercentage: number;
	healthStep: number;
	stamina: number;
	staminaPercentage: number;
	staminaStep: number;
	resistBleed: number;
	resistFire: number;
	resistShock: number;
	resistBlight: number;
	resistToxin: number;
	shieldStepPercentage: number;
	stagger: number;
	weakspot: number;
	weight: number;
	weightPercentage: number;
	weightThreshold: number;
	weightThresholds: number[];
};

type Remnant2LinkedItem = Partial<{
	archetype: { name: string };
	skills: Array<{ name: string }>;
	weapon: { name: string };
	mod: { name: string };
	traits: Array<{ name: string; amount: number }>;
	perks: Array<{ name: string }>;
}>;

type Remnant2InlineTags = (typeof INLINE_ITEM_TAGS)[number]["type"][];
type Remnant2CommunityTags = (typeof COMMUNITY_ITEM_TAGS)[number]["token"][];
type Remnant2SearchableTags = (typeof SEARCHABLE_ITEM_TAGS)[number][];

/**
 * Shared base item type for Remnant 2 items
 * Not intended to be used directly - use Remnant2Item or specific item types instead
 */
type BaseRemnant2Item<TItemSubcategory = string> = AppItem<
	Remnant2ItemCategory,
	TItemSubcategory,
	Remnant2InlineTags,
	Remnant2CommunityTags,
	Remnant2SearchableTags,
	Remnant2LinkedItem
> & {
	wikiUrl: string | undefined;
	dlc: Remnant2DLC;
	location: Remnant2ItemLocation | undefined;
	modifiers?: Partial<ItemModifiers>;
};

type Remnant2LocalItem =
	| Remnant2AmuletItem
	| Remnant2ArchetypeItem
	| Remnant2ArmorItem
	| Remnant2ConcoctionItem
	| Remnant2ConsumableItem
	| Remnant2FusionItem
	| Remnant2ModItem
	| Remnant2MutatorItem
	| Remnant2PerkItem
	| Remnant2PrismItem
	| Remnant2PylonItem
	| Remnant2RelicFragmentItem
	| Remnant2RelicItem
	| Remnant2RingItem
	| Remnant2SkillItem
	| Remnant2TraitItem
	| Remnant2WeaponItem;

type OtherLocation =
	| "World Drop"
	| "Vendor"
	| "Quest"
	| "Aberration"
	| "Linked Item";

// Generic helper types for location definitions
type WorldDungeonLocation<W extends WorldLocation, D> = {
	world: W;
	dungeon: D[] | OtherLocation;
	biome?: never;
	injectable?: Injectable;
};

type WorldBiomeLocation<W extends WorldLocation, B> = {
	world: W;
	dungeon?: never;
	biome: B;
	injectable?: Injectable;
};

type Remnant2ItemLocation =
	| WorldDungeonLocation<"Losomn", LosomnDungeon>
	| WorldBiomeLocation<"Losomn", BiomeNameForWorld<"Losomn">>
	| WorldDungeonLocation<`N'Erud`, NErudDungeon>
	| WorldBiomeLocation<`N'Erud`, BiomeNameForWorld<`N'Erud`>>
	| WorldDungeonLocation<"Yaesha", YaeshaDungeon>
	| WorldBiomeLocation<"Yaesha", BiomeNameForWorld<"Yaesha">>
	| WorldDungeonLocation<"Root Earth", RootEarthDungeon>
	| WorldDungeonLocation<"Labyrinth", LabyrinthDungeon>
	| { world: "Ward 13"; dungeon: "Ward 13" | OtherLocation }
	| { world: "The Backrooms"; dungeon: "The Backrooms" }
	| { world: "Any"; dungeon: OtherLocation };

export type { BaseRemnant2Item, Remnant2LocalItem, Remnant2ItemLocation };
