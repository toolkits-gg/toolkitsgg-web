/**
 * Compares the local RELICS item data array against the wiki's Cargo
 * `items` table (filtered to `class = "Relic"`).
 *
 * Prints matched / new / stale entries to the terminal.
 *
 * Run with: pnpm tsx src/games/remnant2/wiki/relics.ts
 */

import { RELICS } from "#/games/remnant2/core/item-data/relics.ts";
import { syncWikiCategory } from "#/games/remnant2/wiki/sync-category.ts";

void syncWikiCategory({
	category: "Relic",
	label: "relics",
	localItems: RELICS,
});
