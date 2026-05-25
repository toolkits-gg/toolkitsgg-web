/**
 * Compares the local CONSUMABLES item data array against the wiki's Cargo
 * `items` table (filtered to `class = "Consumable"`).
 *
 * Prints matched / new / stale entries to the terminal.
 *
 * Run with: pnpm tsx src/games/remnant2/wiki/consumables.ts
 */

import { CONSUMABLES } from "#/games/remnant2/core/item-data/consumables.ts";
import { syncWikiCategory } from "#/games/remnant2/wiki/sync-category.ts";

void syncWikiCategory({
	category: "Consumable",
	label: "consumables",
	localItems: CONSUMABLES,
});
