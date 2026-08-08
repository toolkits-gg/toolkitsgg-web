import {
	findLinkedItem,
	getFirstLinkedItemRef,
	type LinkedItemRef,
} from "#/features/game/items/utils";
import type { AppItem } from "#/features/game/types";
import { ITEMS } from "#/games/remnant2/core/game-config/items";
import { LINKED_ITEM_CATEGORIES } from "#/games/remnant2/core/game-config/linked-item-categories";
import type { Remnant2LinkedItem } from "#/games/remnant2/core/types";

/**
 * The most important relationship for an item, surfaced next to its name in the
 * info modal.
 *
 * Archetypes are the parent of everything they link to, so instead
 * of their first linked trait they point at their prime perk.
 */
export const resolveRemnant2PrimaryLinkedItem = (
	item: AppItem,
): AppItem | null => {
	const linkedItems = item.linkedItems as Remnant2LinkedItem | undefined;
	if (!linkedItems) return null;

	let ref: LinkedItemRef | undefined;

	if (item.category === "ARCHETYPE") {
		const primePerk = linkedItems.perks?.[0];
		if (primePerk) ref = { relation: "perks", name: primePerk.name };
	} else {
		ref = getFirstLinkedItemRef(item);
	}

	return ref ? findLinkedItem(ref, ITEMS.all, LINKED_ITEM_CATEGORIES) : null;
};
