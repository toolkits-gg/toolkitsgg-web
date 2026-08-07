/**
 * Compares the local MODS item data array against the wiki's Cargo
 * `items` table (filtered to `class = "Mod"`).
 *
 * Prints matched / new / stale entries to the terminal.
 *
 * Run with: pnpm tsx src/games/remnant2/wiki/mods.ts
 */

import { MODS } from "#/games/remnant2/core/item-data/mods.ts";
import { syncWikiCategory } from "#/games/remnant2/wiki/sync-category.ts";

void syncWikiCategory([
	{
		category: "Weapon Mod",
		label: "mods",
		localItems: MODS,
	},
]);
