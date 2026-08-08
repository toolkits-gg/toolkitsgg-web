import {
	findItemByName,
	getFirstLinkedItemName,
} from "#/features/game/items/utils";
import type { AppItem } from "#/features/game/types.ts";
import { ITEMS } from "#/games/remnant2/core/game-config/items";
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

	const name =
		item.category === "ARCHETYPE"
			? linkedItems.perks?.[0]?.name
			: getFirstLinkedItemName(item);

	return name ? findItemByName(name, ITEMS.all) : null;
};
