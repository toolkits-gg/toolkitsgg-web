/**
 * Compares the local POTIONS item data array against the wiki's Module:Potions/StS2 data
 * page.
 *
 * Prints matched / new / stale entries to the terminal.
 *
 * Run with: pnpm tsx src/games/slaythespire2/wiki/potions.ts
 */

import { cleanWikiText } from "#/features/wiki-sync/clean-wiki-text";
import { CHARACTER_MAP } from "#/games/slaythespire2/core/item-data/characters.ts";
import {
	POTION_RARITY_MAP,
	POTIONS,
} from "#/games/slaythespire2/core/item-data/potions";
import {
	type CompareResult,
	getString,
	resolveMapped,
	syncWikiCategory,
} from "#/games/slaythespire2/wiki/sync-category.ts";
import type {
	SlayTheSpire2Character,
	SlayTheSpire2PotionRarity,
} from "@/prisma";

const WIKI_URL =
	"https://slaythespire.wiki.gg/wiki/Module:Potions/StS2%20data?action=raw";

type LocalPotion = (typeof POTIONS)[number];

type WikiPotion = {
	name: string;
	description: string[];
	rarity: SlayTheSpire2PotionRarity | undefined;
	character: SlayTheSpire2Character | null;
	image: string;
};

const normalizeEntry = (
	name: string,
	fields: Record<string, unknown>,
): WikiPotion => {
	const rawRarity = getString(fields, "Rarity").toLowerCase();
	const rawCharacter = getString(fields, "Character").toLowerCase();

	return {
		name,
		description: cleanWikiText(getString(fields, "Text")),
		image: getString(fields, "Image"),
		rarity: resolveMapped(rawRarity, POTION_RARITY_MAP, "rarity", name),
		character:
			resolveMapped(rawCharacter, CHARACTER_MAP, "character", name) ?? null,
	};
};

const comparePotion = (local: LocalPotion, wiki: WikiPotion): CompareResult => {
	const differingFields: string[] = [];

	const localDesc = JSON.stringify(local.description);
	const wikiDesc = JSON.stringify(wiki.description);
	if (localDesc !== wikiDesc) {
		differingFields.push("description");
	}

	return {
		differingFields,
		printDetails: () => {
			if (localDesc !== wikiDesc) {
				console.log(`    description local: ${localDesc}`);
				console.log(`    description wiki:  ${wikiDesc}`);
			}
		},
	};
};

void syncWikiCategory<LocalPotion, WikiPotion>({
	wikiUrl: WIKI_URL,
	label: "potions",
	localItems: POTIONS,
	normalizeEntry,
	compareItem: comparePotion,
});
