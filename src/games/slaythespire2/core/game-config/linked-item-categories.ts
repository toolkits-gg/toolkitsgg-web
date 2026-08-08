import type { SlayTheSpire2LinkedItem } from "#/games/slaythespire2/core/types";
import type { SlayTheSpire2ItemCategory } from "@/prisma";

/**
 * The item category each linked item relationship points at.
 * Names are only unique within a category, so resolution needs the category
 * to resolve the right item.
 */
const LINKED_ITEM_CATEGORIES = {
	ancient: "ANCIENT",
	character: "CHARACTER",
	relic: "RELIC",
} satisfies Record<keyof SlayTheSpire2LinkedItem, SlayTheSpire2ItemCategory>;

export { LINKED_ITEM_CATEGORIES };
