import type { Remnant2LinkedItem } from "#/games/remnant2/core/types";
import type { Remnant2ItemCategory } from "@/prisma";

/**
 * The item category each linked item relationship points at.
 * Names are only unique within a category, so resolution needs the category
 * to resolve the right item.
 */
const LINKED_ITEM_CATEGORIES = {
	archetype: "ARCHETYPE",
	skills: "SKILL",
	weapon: "WEAPON",
	mod: "MOD",
	traits: "TRAIT",
	perks: "PERK",
} satisfies Record<keyof Remnant2LinkedItem, Remnant2ItemCategory>;

export { LINKED_ITEM_CATEGORIES };
