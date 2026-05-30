/**
 * Compares the local CARDS item data array against the wiki's card data.
 * Prints matched / new / stale entries to the terminal.
 *
 * On slaythespire.wiki.gg the card data is split into submodules
 * `Module:Cards/StS2 data/<Character>`.
 *
 * Run with: pnpm tsx src/games/slaythespire2/wiki/cards.ts
 */

import { cleanWikiText } from "#/features/wiki-sync/clean-wiki-text";
import {
	CARDS,
	type SlayTheSpire2CardItem,
} from "#/games/slaythespire2/core/item-data/cards.ts";
import {
	type CompareResult,
	getString,
	syncWikiCategory,
} from "#/games/slaythespire2/wiki/sync-category.ts";

const CARD_SUBMODULES = [
	"Ironclad",
	"Silent",
	"Regent",
	"Necrobinder",
	"Defect",
	"Colorless",
] as const;

const WIKI_URLS = CARD_SUBMODULES.map(
	(c) =>
		`https://slaythespire.wiki.gg/wiki/Module:Cards/StS2%20data/${c}?action=raw`,
);

type LocalCard = (typeof CARDS)[number];

type WikiCard = {
	name: string;
	description: string[];
	cost: number | undefined;
	type: string;
	rarity: string;
	color: string;
	image: string;
};

const getNumber = (
	fields: Record<string, unknown>,
	key: string,
): number | undefined =>
	typeof fields[key] === "number" ? (fields[key] as number) : undefined;

const normalizeEntry = (
	name: string,
	fields: Record<string, unknown>,
): WikiCard => ({
	name,
	description: cleanWikiText(getString(fields, "Text")),
	cost: getNumber(fields, "Cost"),
	type: getString(fields, "Type"),
	rarity: getString(fields, "Rarity"),
	color: getString(fields, "Color"),
	image: getString(fields, "Image"),
});

const compareCard = (local: LocalCard, wiki: WikiCard): CompareResult => {
	const localDesc = JSON.stringify(local.description);
	const wikiDesc = JSON.stringify(wiki.description);
	const localCost = local.cost.energy;
	const wikiCost = wiki.cost;

	const differingFields: string[] = [];
	if (localDesc !== wikiDesc) differingFields.push("description");
	if (wikiCost !== undefined && localCost !== wikiCost) {
		differingFields.push("cost.energy");
	}

	return {
		differingFields,
		printDetails: () => {
			if (localDesc !== wikiDesc) {
				console.log(`    description local: ${localDesc}`);
				console.log(`    description wiki:  ${wikiDesc}`);
			}
			if (wikiCost !== undefined && localCost !== wikiCost) {
				console.log(`    cost.energy local: ${localCost}`);
				console.log(`    cost.energy wiki:  ${wikiCost}`);
			}
		},
	};
};

void syncWikiCategory<SlayTheSpire2CardItem, WikiCard>({
	wikiUrls: WIKI_URLS,
	label: "cards",
	localItems: CARDS,
	normalizeEntry,
	compareItem: compareCard,
});
