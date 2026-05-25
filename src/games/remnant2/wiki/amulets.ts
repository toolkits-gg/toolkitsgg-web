/**
 * Compares the local AMULETS item data array against the wiki's Cargo
 * `items` table (filtered to `class = "Amulet"`).
 *
 * Prints matched / new / stale entries to the terminal.
 *
 * Run with: pnpm tsx src/games/remnant2/wiki/amulets.ts
 */

import { AMULETS } from "#/games/remnant2/core/item-data/amulets.ts";
import { syncWikiCategory } from "#/games/remnant2/wiki/sync-category.ts";

void syncWikiCategory([
	{
		category: "Amulet",
		label: "amulets",
		localItems: AMULETS,
	},
]);
