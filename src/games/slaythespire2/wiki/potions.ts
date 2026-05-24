/**
 * Compares the local POTIONS item data array against the wiki's Module:Potions/StS2 data
 * page.
 *
 * Prints matched / new / stale entries to the terminal.
 *
 * Run with: pnpm tsx src/games/slaythespire2/wiki/potions.ts
 */

import { cleanWikiText } from "#/features/wiki-sync/clean-wiki-text";
import { parseLuaModule } from "#/features/wiki-sync/parse-lua-module";
import { fetchWithUserAgent } from "#/features/wiki-sync/utils";
import { CHARACTER_MAP } from "#/games/slaythespire2/core/item-data/characters.ts";
import {
	POTION_RARITY_MAP,
	POTIONS,
} from "#/games/slaythespire2/core/item-data/potions";
import type {
	SlayTheSpire2Character,
	SlayTheSpire2PotionRarity,
} from "@/prisma";

const WIKI_URL =
	"https://slaythespire.wiki.gg/wiki/Module:Potions/StS2%20data?action=raw";

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
	const rawText = typeof fields.Text === "string" ? fields.Text : "";
	const rawRarity =
		typeof fields.Rarity === "string" ? fields.Rarity.toLowerCase() : "";
	const rawCharacter =
		typeof fields.Character === "string" ? fields.Character.toLowerCase() : "";
	const rawImage = typeof fields.Image === "string" ? fields.Image : "";

	const description = cleanWikiText(rawText);
	const rarity = POTION_RARITY_MAP[rawRarity];
	if (rawRarity && !rarity) {
		console.warn(`  ! unknown rarity '${rawRarity}' for ${name}`);
	}

	const character = rawCharacter ? (CHARACTER_MAP[rawCharacter] ?? null) : null;
	if (rawCharacter && !character) {
		console.warn(`  ! unknown character '${rawCharacter}' for ${name}`);
	}

	return { name, description, rarity, character, image: rawImage };
};

const main = async () => {
	console.log(`Fetching ${WIKI_URL}\n`);
	const res = await fetchWithUserAgent(WIKI_URL);
	if (!res.ok) {
		throw new Error(`Wiki fetch failed: ${res.status} ${res.statusText}`);
	}
	const raw = await res.text();

	const parsed = parseLuaModule(raw);
	const wikiPotions: WikiPotion[] = Object.entries(parsed).map(
		([name, fields]) => normalizeEntry(name, fields as Record<string, unknown>),
	);

	console.log(
		`\nFetched ${wikiPotions.length} potions from wiki; local has ${POTIONS.length}.\n`,
	);

	const localByName = new Map(POTIONS.map((p) => [p.name, p] as const));
	const wikiByName = new Map(wikiPotions.map((p) => [p.name, p] as const));

	let matchedCount = 0;
	let descriptionDiffCount = 0;
	let newCount = 0;
	let staleCount = 0;

	for (const w of wikiPotions) {
		const local = localByName.get(w.name);
		if (local) {
			matchedCount++;
			const localDesc = JSON.stringify(local.description);
			const wikiDesc = JSON.stringify(w.description);
			if (localDesc !== wikiDesc) {
				descriptionDiffCount++;
				console.log(`~ matched (description differs): ${w.name}`);
				console.log(`    local: ${localDesc}`);
				console.log(`    wiki:  ${wikiDesc}`);
			} else {
				console.log(`✓ matched: ${w.name}`);
			}
		} else {
			newCount++;
			console.log(`+ new (wiki only): ${w.name}`);
			console.log(`${JSON.stringify(w, null, 2)}`);
		}
	}

	for (const l of POTIONS) {
		if (!wikiByName.has(l.name)) {
			staleCount++;
			console.log(`- stale (local only): ${l.name}`);
		}
	}

	console.log(
		`\nSummary: ${matchedCount} matched (${descriptionDiffCount} with description diffs), ${newCount} new, ${staleCount} stale.`,
	);
};

void main();
