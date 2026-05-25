/**
 * Compares the local CONSUMABLES item data array against the wiki's Cargo
 * `items` table — checked against the union of `class = "Consumable"` and
 * `class = "Curative"` rows, since the wiki splits what we treat as one
 * local category into two classes.
 *
 * Prints matched / new / stale entries to the terminal.
 *
 * Run with: pnpm tsx src/games/remnant2/wiki/consumables.ts
 */

import { CONSUMABLES } from "#/games/remnant2/core/item-data/consumables.ts";
import { syncWikiCategory } from "#/games/remnant2/wiki/sync-category.ts";

void syncWikiCategory([
	{
		category: "Consumable",
		label: "consumables",
		localItems: CONSUMABLES,
	},
	{
		category: "Curative",
		label: "curatives",
		localItems: CONSUMABLES,
	},
	{
		category: "Grenade",
		label: "grenades",
		localItems: CONSUMABLES,
	},
]);
