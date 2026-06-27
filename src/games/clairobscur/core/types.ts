import type { ClairObscurCharacterItem } from "#/games/clairobscur/core/item-data/characters.ts";
import type {
	ClairObscurCharacter,
	ClairObscurDLC,
	ClairObscurItemCategory,
} from "@/prisma";
import type {AppItem} from "#/features/game/types.ts";

type ClairObscurItemLocation = "Overgrowth" | "Underdocks" | "Hive" | "Glory";

// Placeholder until we have actual tags to use
type ClairObscurInlineTags = string[];
type ClairObscurCommunityTags = string[];
type ClairObscurSearchableTags = string[];

type ClairObscurLinkedItem = Partial<{
	character: { name: ClairObscurCharacter };
}>;

type ItemModifiers = {
	block: number;
	blockX: number;
	channel: Array<{ type: string; amount: number }>;
	damage: number;
	damageX: number;
	dexterity: number;
	doom: number;
	draw: number;
	energy: number;
	exhaust: boolean;
	focus: number;
	gold: number;
	heal: number;
	health: number;
	intangible: number;
	poison: number;
	plating: number;
	retainHand: boolean;
	stars: number;
	strength: number;
	summon: number;
	summonPerTurn: number;
	thorns: number;
	vulnerable: number;
	weak: number;

	enemyDamage: number;
	enemyDamageX: number;
	enemyHealth: number;
	enemyStrength: number;
};

type ModifierTrigger =
	| number // number of turns
	| "attack"
	| "cards added to deck"
	| "combat start"
	| "combat"
	| "combat end"
	| "each turn"
	| "enter shop"
	| "first three turns"
	| "first time lose HP"
	| "first time play Power"
	| "next attack"
	| "permanent"
	| "shuffle draw pile";

/**
 * Shared base item type for Slay The Spire 2 items
 * Not intended to be used directly - use ClairObscurItem or specific item types instead
 */
type BaseClairObscurItem<TItemSubcategory = string> = AppItem<
	ClairObscurItemCategory,
	TItemSubcategory,
	ClairObscurInlineTags,
	ClairObscurCommunityTags,
	ClairObscurSearchableTags,
	ClairObscurLinkedItem
> & {
	wikiUrl: string | undefined;
	dlc: ClairObscurDLC;
	location: ClairObscurItemLocation | undefined;
	modifiers:
		| Array<{ modifier: Partial<ItemModifiers>; trigger: ModifierTrigger }>
		| undefined;
};

type ClairObscurLocalItem = ClairObscurCharacterItem; // TODO Add other item types

export type {
	BaseClairObscurItem,
	ClairObscurLocalItem,
	ClairObscurItemLocation,
};
