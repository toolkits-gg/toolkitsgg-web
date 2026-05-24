/**
 * Compares the local AMULETS item data array against the wiki's Cargo
 * `items` table (filtered to `class = "Amulet"`).
 *
 * Prints matched / new / stale entries to the terminal.
 *
 * Run with: pnpm tsx src/games/remnant2/wiki/amulets.ts
 */

import { cargoQueryAll } from "#/features/wiki-sync/cargo-query";
import { cleanCargoHtml } from "#/features/wiki-sync/clean-cargo-html";
import { AMULETS } from "#/games/remnant2/core/item-data/amulets.ts";
import type { Remnant2DLC } from "@/prisma";

const WIKI_API_URL = "https://remnant2.wiki.gg/api.php";

const DLC_MAP: Record<string, Remnant2DLC> = {
	"": "BASE",
	"[[The Awakened King]]": "DLC1",
	"[[The Forgotten Kingdom]]": "DLC2",
	"[[The Dark Horizon]]": "DLC3",
};

type CargoAmuletRow = {
	page: string;
	name: string;
	image: string;
	dlc: string;
	description: string;
};

type WikiAmulet = {
	name: string;
	page: string;
	image: string;
	description: string[];
	dlc: Remnant2DLC | undefined;
};

const normalizeEntry = (row: CargoAmuletRow): WikiAmulet => {
	const rawDlc = (row.dlc ?? "").trim();
	const dlc = DLC_MAP[rawDlc];
	if (!dlc) {
		console.warn(`  ! unknown require_dlc '${rawDlc}' for ${row.name}`);
	}
	return {
		name: row.name,
		page: row.page,
		image: row.image,
		dlc,
		description: cleanCargoHtml(row.description ?? ""),
	};
};

const main = async () => {
	console.log(`Fetching amulets via cargoquery from ${WIKI_API_URL}\n`);

	const rows = await cargoQueryAll<CargoAmuletRow>({
		apiUrl: WIKI_API_URL,
		tables: "items",
		fields: "items._pageName=page,name,image,require_dlc=dlc,description",
		where: 'items.class="Amulet"',
		orderBy: "name",
	});

	const wikiAmulets = rows.map(normalizeEntry);

	console.log(
		`\nFetched ${wikiAmulets.length} amulets from wiki; local has ${AMULETS.length}.\n`,
	);

	const localByName = new Map(AMULETS.map((a) => [a.name, a] as const));
	const wikiByName = new Map(wikiAmulets.map((a) => [a.name, a] as const));

	let matchedCount = 0;
	let descriptionDiffCount = 0;
	let dlcDiffCount = 0;
	let newCount = 0;
	let staleCount = 0;

	for (const w of wikiAmulets) {
		const local = localByName.get(w.name);
		if (!local) {
			newCount++;
			console.log(`+ new (wiki only): ${w.name}`);
			console.log(`${JSON.stringify(w, null, 2)}`);
			continue;
		}

		matchedCount++;
		const diffs: string[] = [];

		const localDesc = JSON.stringify(local.description);
		const wikiDesc = JSON.stringify(w.description);
		if (localDesc !== wikiDesc) {
			descriptionDiffCount++;
			diffs.push("description");
		}

		if (w.dlc && local.dlc !== w.dlc) {
			dlcDiffCount++;
			diffs.push("dlc");
		}

		if (diffs.length === 0) {
			console.log(`✓ matched: ${w.name}`);
			continue;
		}

		console.log(`~ matched (${diffs.join(", ")} differs): ${w.name}`);
		if (diffs.includes("description")) {
			console.log(`    description local: ${localDesc}`);
			console.log(`    description wiki:  ${wikiDesc}`);
		}
		if (diffs.includes("dlc")) {
			console.log(`    dlc local: ${local.dlc}`);
			console.log(`    dlc wiki:  ${w.dlc}`);
		}
	}

	for (const l of AMULETS) {
		if (!wikiByName.has(l.name)) {
			staleCount++;
			console.log(`- stale (local only): ${l.name}`);
		}
	}

	console.log(
		`\nSummary: ${matchedCount} matched (${descriptionDiffCount} with description diffs, ${dlcDiffCount} with dlc diffs), ${newCount} new, ${staleCount} stale.`,
	);
};

void main();
