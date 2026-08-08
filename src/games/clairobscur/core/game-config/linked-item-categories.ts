import type { ClairObscurLinkedItem } from "#/games/clairobscur/core/types";
import type { ClairObscurItemCategory } from "@/prisma";

/**
 * The item category each linked item relationship points at.
 * Names are only unique within a category, so resolution needs the category
 * to resolve the right item.
 */
const LINKED_ITEM_CATEGORIES = {
	character: "CHARACTER",
} satisfies Record<keyof ClairObscurLinkedItem, ClairObscurItemCategory>;

export { LINKED_ITEM_CATEGORIES };
