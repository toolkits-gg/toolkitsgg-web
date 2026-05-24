/**
 * Compares the local RELICS item data array against the wiki's Module:Relics/StS2 data
 * page.
 *
 * Prints matched / new / stale entries to the terminal.
 *
 * Run with: pnpm tsx src/games/slaythespire2/wiki/relics.ts
 */

import { cleanWikiText } from "#/features/wiki-sync/clean-wiki-text";
import { ANCIENT_MAP } from "#/games/slaythespire2/core/item-data/ancients.ts";
import { CHARACTER_MAP } from "#/games/slaythespire2/core/item-data/characters.ts";
import {
	RELIC_RARITY_MAP,
	RELICS,
} from "#/games/slaythespire2/core/item-data/relics.ts";
import {
	type CompareResult,
	syncWikiCategory,
} from "#/games/slaythespire2/wiki/sync-category.ts";
import type {
	SlayTheSpire2Ancient,
	SlayTheSpire2Character,
	SlayTheSpire2RelicRarity,
} from "@/prisma";

const WIKI_URL =
	"https://slaythespire.wiki.gg/wiki/Module:Relics/StS2%20data?action=raw";

type LocalRelic = (typeof RELICS)[number];

type WikiRelic = {
	name: string;
	description: string[];
	flavorText: string;
	isUpgrade: boolean;
	rarity: SlayTheSpire2RelicRarity | undefined;
	character: SlayTheSpire2Character | null;
	ancient: SlayTheSpire2Ancient | null;
	image: string;
};

const normalizeEntry = (
	name: string,
	fields: Record<string, unknown>,
): WikiRelic => {
	const rawText =
		typeof fields.Description === "string" ? fields.Description : "";
	const rawRarity =
		typeof fields.Rarity === "string" ? fields.Rarity.toLowerCase() : "";
	const rawCharacter =
		typeof fields.Character === "string" ? fields.Character.toLowerCase() : "";
	const rawAncient =
		typeof fields.Ancient === "string" ? fields.Ancient.toLowerCase() : "";
	const rawImage = typeof fields.Image === "string" ? fields.Image : "";
	const rawFlavorText = typeof fields.Flavor === "string" ? fields.Flavor : "";
	const rawUpgrade = typeof fields.Upgrade === "string" ? fields.Upgrade : "";
	const rawIsUpgrade = rawUpgrade.toLowerCase() === "yes";

	const description = cleanWikiText(rawText);
	const rarity = RELIC_RARITY_MAP[rawRarity];
	if (rawRarity && !rarity) {
		console.warn(`  ! unknown rarity '${rawRarity}' for ${name}`);
	}

	const character = rawCharacter ? (CHARACTER_MAP[rawCharacter] ?? null) : null;
	if (rawCharacter && !character) {
		console.warn(`  ! unknown character '${rawCharacter}' for ${name}`);
	}

	const ancient = rawAncient ? (ANCIENT_MAP[rawAncient] ?? null) : null;
	if (rawAncient && !ancient) {
		console.warn(`  ! unknown ancient '${rawAncient}' for ${name}`);
	}

	return {
		name,
		description,
		rarity,
		character,
		ancient,
		flavorText: rawFlavorText,
		isUpgrade: rawIsUpgrade,
		image: rawImage,
	};
};

const compareRelic = (local: LocalRelic, wiki: WikiRelic): CompareResult => {
	const differingFields: string[] = [];

	const localDesc = JSON.stringify(local.description);
	const wikiDesc = JSON.stringify(wiki.description);
	if (localDesc !== wikiDesc) {
		differingFields.push("description");
	}

	const isUpgradeDiffers = local.isUpgrade !== wiki.isUpgrade;
	if (isUpgradeDiffers) {
		differingFields.push("isUpgrade");
	}

	const localFlavorText = JSON.stringify(local.flavorText);
	const wikiFlavorText = JSON.stringify(wiki.flavorText);
	if (localFlavorText !== wikiFlavorText) {
		differingFields.push("flavorText");
	}

	const localCharacter = local.linkedItems?.character?.name ?? null;
	const localAncient = local.linkedItems?.ancient?.name ?? null;
	const linkedItemIssues: string[] = [];
	if (wiki.character !== localCharacter) {
		if (wiki.character && !localCharacter) {
			linkedItemIssues.push(
				`missing linkedItems.character (expected '${wiki.character}')`,
			);
		} else if (!wiki.character && localCharacter) {
			linkedItemIssues.push(
				`unexpected linkedItems.character '${localCharacter}' (wiki has none)`,
			);
		} else {
			linkedItemIssues.push(
				`linkedItems.character mismatch (local '${localCharacter}' vs wiki '${wiki.character}')`,
			);
		}
	}
	if (wiki.ancient !== localAncient) {
		if (wiki.ancient && !localAncient) {
			linkedItemIssues.push(
				`missing linkedItems.ancient (expected '${wiki.ancient}')`,
			);
		} else if (!wiki.ancient && localAncient) {
			linkedItemIssues.push(
				`unexpected linkedItems.ancient '${localAncient}' (wiki has none)`,
			);
		} else {
			linkedItemIssues.push(
				`linkedItems.ancient mismatch (local '${localAncient}' vs wiki '${wiki.ancient}')`,
			);
		}
	}
	if (linkedItemIssues.length > 0) {
		differingFields.push("linkedItems");
	}

	return {
		differingFields,
		printDetails: () => {
			if (localDesc !== wikiDesc) {
				console.log(`    description local: ${localDesc}`);
				console.log(`    description wiki:  ${wikiDesc}`);
			}
			if (isUpgradeDiffers) {
				console.log(`    isUpgrade local: ${local.isUpgrade}`);
				console.log(`    isUpgrade wiki:  ${wiki.isUpgrade}`);
			}
			if (localFlavorText !== wikiFlavorText) {
				console.log(`    flavorText local: ${localFlavorText}`);
				console.log(`    flavorText wiki:  ${wikiFlavorText}`);
			}
			for (const issue of linkedItemIssues) {
				console.log(`    ! ${issue}`);
			}
		},
	};
};

void syncWikiCategory<LocalRelic, WikiRelic>({
	wikiUrl: WIKI_URL,
	label: "relics",
	localItems: RELICS,
	normalizeEntry,
	compareItem: compareRelic,
});
