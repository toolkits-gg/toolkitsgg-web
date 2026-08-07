/**
 * Compares the local RINGS item data array against the wiki's Cargo
 * `items` table (filtered to `class = "Ring"`).
 *
 * Prints matched / new / stale entries to the terminal.
 *
 * Run with: pnpm tsx src/games/remnant2/wiki/rings.ts
 */

import { RINGS } from "#/games/remnant2/core/item-data/rings.ts";
import { syncWikiCategory } from "#/games/remnant2/wiki/sync-category.ts";

void syncWikiCategory([
	{
		category: "Ring",
		label: "rings",
		localItems: RINGS,
	},
]);
