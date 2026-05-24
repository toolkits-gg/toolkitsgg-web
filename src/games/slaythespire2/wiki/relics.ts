/**
 * Compares the local RELICS item data array against the wiki's Module:Relics/StS2 data
 * page.
 *
 * Prints matched / new / stale entries to the terminal.
 *
 * Run with: pnpm tsx src/games/slaythespire2/wiki/relics.ts
 */

import { cleanWikiText } from "#/features/wiki-sync/clean-wiki-text";
import { parseLuaModule } from "#/features/wiki-sync/parse-lua-module";
import { fetchWithUserAgent } from "#/features/wiki-sync/utils";
import { ANCIENT_MAP } from "#/games/slaythespire2/core/item-data/ancients.ts";
import { CHARACTER_MAP } from "#/games/slaythespire2/core/item-data/characters.ts";
import {
	RELIC_RARITY_MAP,
	RELICS,
} from "#/games/slaythespire2/core/item-data/relics.ts";
import type {
	SlayTheSpire2Ancient,
	SlayTheSpire2Character,
	SlayTheSpire2RelicRarity,
} from "@/prisma";

const WIKI_URL =
	"https://slaythespire.wiki.gg/wiki/Module:Relics/StS2%20data?action=raw";

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

const main = async () => {
	console.log(`Fetching ${WIKI_URL}\n`);
	const res = await fetchWithUserAgent(WIKI_URL);
	if (!res.ok) {
		throw new Error(`Wiki fetch failed: ${res.status} ${res.statusText}`);
	}
	const raw = await res.text();

	const parsed = parseLuaModule(raw);
	const wikiRelics: WikiRelic[] = Object.entries(parsed).map(([name, fields]) =>
		normalizeEntry(name, fields as Record<string, unknown>),
	);

	console.log(
		`\nFetched ${wikiRelics.length} relics from wiki; local has ${RELICS.length}.\n`,
	);

	const localByName = new Map(RELICS.map((p) => [p.name, p] as const));
	const wikiByName = new Map(wikiRelics.map((p) => [p.name, p] as const));

	let matchedCount = 0;
	let descriptionDiffCount = 0;
	let isUpgradeDiffCount = 0;
	let flavorTextDiffCount = 0;
	let linkedItemDiffCount = 0;
	let newCount = 0;
	let staleCount = 0;

	for (const w of wikiRelics) {
		const local = localByName.get(w.name);
		if (local) {
			matchedCount++;
			const diffs: string[] = [];

			const localDesc = JSON.stringify(local.description);
			const wikiDesc = JSON.stringify(w.description);
			if (localDesc !== wikiDesc) {
				descriptionDiffCount++;
				diffs.push("description");
			}

			if (local.isUpgrade !== w.isUpgrade) {
				isUpgradeDiffCount++;
				diffs.push("isUpgrade");
			}

			const localFlavorText = JSON.stringify(local.flavorText);
			const wikiFlavorText = JSON.stringify(w.flavorText);
			if (localFlavorText !== wikiFlavorText) {
				flavorTextDiffCount++;
				diffs.push("flavorText");
			}

			const localCharacter = local.linkedItems?.character?.name ?? null;
			const localAncient = local.linkedItems?.ancient?.name ?? null;
			const linkedItemIssues: string[] = [];
			if (w.character !== localCharacter) {
				if (w.character && !localCharacter) {
					linkedItemIssues.push(
						`missing linkedItems.character (expected '${w.character}')`,
					);
				} else if (!w.character && localCharacter) {
					linkedItemIssues.push(
						`unexpected linkedItems.character '${localCharacter}' (wiki has none)`,
					);
				} else {
					linkedItemIssues.push(
						`linkedItems.character mismatch (local '${localCharacter}' vs wiki '${w.character}')`,
					);
				}
			}
			if (w.ancient !== localAncient) {
				if (w.ancient && !localAncient) {
					linkedItemIssues.push(
						`missing linkedItems.ancient (expected '${w.ancient}')`,
					);
				} else if (!w.ancient && localAncient) {
					linkedItemIssues.push(
						`unexpected linkedItems.ancient '${localAncient}' (wiki has none)`,
					);
				} else {
					linkedItemIssues.push(
						`linkedItems.ancient mismatch (local '${localAncient}' vs wiki '${w.ancient}')`,
					);
				}
			}
			if (linkedItemIssues.length > 0) {
				linkedItemDiffCount++;
				diffs.push("linkedItems");
			}

			if (diffs.length > 0) {
				console.log(`~ matched (${diffs.join(", ")} differs): ${w.name}`);

				if (localDesc !== wikiDesc) {
					console.log(`    description local: ${localDesc}`);
					console.log(`    description wiki:  ${wikiDesc}`);
				}

				if (local.isUpgrade !== w.isUpgrade) {
					console.log(`    isUpgrade local: ${local.isUpgrade}`);
					console.log(`    isUpgrade wiki:  ${w.isUpgrade}`);
				}

				if (localFlavorText !== wikiFlavorText) {
					console.log(`    flavorText local: ${localFlavorText}`);
					console.log(`    flavorText wiki:  ${wikiFlavorText}`);
				}

				for (const issue of linkedItemIssues) {
					console.log(`    ! ${issue}`);
				}
			} else {
				console.log(`✓ matched: ${w.name}`);
			}
		} else {
			newCount++;
			console.log(`+ new (wiki only): ${w.name}`);
			console.log(`${JSON.stringify(w, null, 2)}`);
		}
	}

	for (const l of RELICS) {
		if (!wikiByName.has(l.name)) {
			staleCount++;
			console.log(`- stale (local only): ${l.name}`);
		}
	}

	console.log(
		`\nSummary: ${matchedCount} matched (${descriptionDiffCount} with description diffs, ${isUpgradeDiffCount} with isUpgrade diffs, ${flavorTextDiffCount} with flavorText diffs, ${linkedItemDiffCount} with linkedItem diffs), ${newCount} new, ${staleCount} stale.`,
	);
};

void main();
