/**
 * Compares the local MUTATORS item data array against the wiki's Cargo
 * `items` table (filtered to `class = "Mutator"`).
 *
 * The wiki packs the mutator's base description and its max-level bonus into
 * a single `description` column separated by `<br>`, with the bonus prefixed
 * by `Level N:` (the level varies per mutator). Local mutators store the
 * two apart in `description` and `maxLevelBonus`, with the `Level N:` prefix
 * stripped — so the splitter routes any `Level N:` line into `maxLevelBonus`
 * (prefix removed). When no prefixed line is present, it falls back to
 * treating the last cleaned line as the bonus.
 *
 * Prints matched / new / stale entries to the terminal.
 *
 * Run with: pnpm tsx src/games/remnant2/wiki/mutators.ts
 */

import { MUTATORS } from "#/games/remnant2/core/item-data/mutators.ts";
import { syncWikiCategory } from "#/games/remnant2/wiki/sync-category.ts";

const LEVEL_BONUS_PREFIX = /^Level \d+:\s*/;

const splitMutatorWiki = (lines: string[]) => {
	const bonusLines = lines.filter((l) => LEVEL_BONUS_PREFIX.test(l));
	if (bonusLines.length > 0) {
		return {
			description: lines.filter((l) => !LEVEL_BONUS_PREFIX.test(l)),
			maxLevelBonus: bonusLines.map((l) => l.replace(LEVEL_BONUS_PREFIX, "")),
		};
	}
	return {
		description: lines.slice(0, -1),
		maxLevelBonus: lines.slice(-1),
	};
};

void syncWikiCategory([
	{
		category: "Mutator",
		label: "mutators",
		localItems: MUTATORS,
		splitWikiArray: splitMutatorWiki,
	},
]);
