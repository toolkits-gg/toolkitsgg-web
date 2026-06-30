/**
 * Compares the local RELICS item data array against the wiki's Module:Relics/StS2 data
 * page.
 *
 * Prints matched / new / stale entries to the terminal.
 *
 * Run with: pnpm tsx src/games/slaythespire2/wiki/relics.ts
 */

import { cleanWikiText } from "#/features/sync/wiki/clean-wiki-text";
import { ANCIENT_MAP } from "#/games/slaythespire2/core/item-data/ancients.ts";
import { CHARACTER_MAP } from "#/games/slaythespire2/core/item-data/characters.ts";
import {
	RELIC_RARITY_MAP,
	RELICS,
} from "#/games/slaythespire2/core/item-data/relics.ts";
import {
	type CompareResult,
	getString,
	resolveMapped,
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
	const rawRarity = getString(fields, "Rarity").toLowerCase();
	const rawCharacter = getString(fields, "Character").toLowerCase();
	const rawAncient = getString(fields, "Ancient").toLowerCase();

	return {
		name,
		description: cleanWikiText(getString(fields, "Description")),
		flavorText: getString(fields, "Flavor"),
		isUpgrade: getString(fields, "Upgrade").toLowerCase() === "yes",
		image: getString(fields, "Image"),
		rarity: resolveMapped(rawRarity, RELIC_RARITY_MAP, "rarity", name),
		character:
			resolveMapped(rawCharacter, CHARACTER_MAP, "character", name) ?? null,
		ancient: resolveMapped(rawAncient, ANCIENT_MAP, "ancient", name) ?? null,
	};
};

const diffLinkedItem = (
	fieldName: string,
	localValue: string | null,
	wikiValue: string | null,
): string | null => {
	if (wikiValue === localValue) return null;
	if (wikiValue && !localValue) {
		return `missing linkedItems.${fieldName} (expected '${wikiValue}')`;
	}
	if (!wikiValue && localValue) {
		return `unexpected linkedItems.${fieldName} '${localValue}' (wiki has none)`;
	}
	return `linkedItems.${fieldName} mismatch (local '${localValue}' vs wiki '${wikiValue}')`;
};

type ScalarDiff = { field: string; local: string; wiki: string };

const compareRelic = (local: LocalRelic, wiki: WikiRelic): CompareResult => {
	const scalarDiffs: ScalarDiff[] = (
		[
			{
				field: "description",
				local: JSON.stringify(local.description),
				wiki: JSON.stringify(wiki.description),
			},
			{
				field: "isUpgrade",
				local: String(local.isUpgrade),
				wiki: String(wiki.isUpgrade),
			},
			{
				field: "flavorText",
				local: JSON.stringify(local.flavorText),
				wiki: JSON.stringify(wiki.flavorText),
			},
		] satisfies ScalarDiff[]
	).filter((d) => d.local !== d.wiki);

	const linkedItemIssues = [
		diffLinkedItem(
			"character",
			local.linkedItems?.character?.name ?? null,
			wiki.character,
		),
		diffLinkedItem(
			"ancient",
			local.linkedItems?.ancient?.name ?? null,
			wiki.ancient,
		),
	].filter((issue): issue is string => issue !== null);

	const differingFields = scalarDiffs.map((d) => d.field);
	if (linkedItemIssues.length > 0) {
		differingFields.push("linkedItems");
	}

	return {
		differingFields,
		printDetails: () => {
			for (const diff of scalarDiffs) {
				console.log(`    ${diff.field} local: ${diff.local}`);
				console.log(`    ${diff.field} wiki:  ${diff.wiki}`);
			}
			for (const issue of linkedItemIssues) {
				console.log(`    ! ${issue}`);
			}
		},
	};
};

void syncWikiCategory<LocalRelic, WikiRelic>({
	wikiUrls: [WIKI_URL],
	label: "relics",
	localItems: RELICS,
	normalizeEntry,
	compareItem: compareRelic,
});
