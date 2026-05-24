/**
 * Shared comparison runner for Remnant2 wiki sync scripts.
 *
 * Each per-category script (rings, amulets, ...) passes its local item array,
 * the Cargo `class` filter, and a plural label for log output. The runner
 * fetches matching rows from the wiki's Cargo `items` table and prints
 * matched / new / stale diffs against the local data.
 *
 * Names are compared case-insensitively because the wiki's `items.name`
 * column inconsistently title-cases connector words (e.g. "Stone Of
 * Malevolence" vs "Burden of the Audacious").
 */

import { cargoQueryAll } from "#/features/wiki-sync/cargo-query";
import { cleanCargoHtml } from "#/features/wiki-sync/clean-cargo-html";
import type { BaseRemnant2Item } from "#/games/remnant2/core/types";
import type { Remnant2DLC } from "@/prisma";

const WIKI_API_URL = "https://remnant2.wiki.gg/api.php";

const DLC_MAP: Record<string, Remnant2DLC> = {
	"": "BASE",
	"[[The Awakened King]]": "DLC1",
	"[[The Forgotten Kingdom]]": "DLC2",
	"[[The Dark Horizon]]": "DLC3",
};

type CargoItemRow = {
	page: string;
	name: string;
	image: string;
	dlc: string;
	description: string;
};

type WikiItem = {
	name: string;
	page: string;
	image: string;
	description: string[];
	dlc: Remnant2DLC | undefined;
};

type SyncCategoryOptions<TItem> = {
	category: string;
	label: string;
	localItems: readonly TItem[];
};

const normalizeEntry = (row: CargoItemRow): WikiItem => {
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

const syncWikiCategory = async <
	TItem extends Pick<BaseRemnant2Item, "name" | "description" | "dlc">,
>(
	opts: SyncCategoryOptions<TItem>,
): Promise<void> => {
	const { category, label, localItems } = opts;

	console.log(`Fetching ${label} via cargoquery from ${WIKI_API_URL}\n`);

	const rows = await cargoQueryAll<CargoItemRow>({
		apiUrl: WIKI_API_URL,
		tables: "items",
		fields: "items._pageName=page,name,image,require_dlc=dlc,description",
		where: `items.class="${category}"`,
		orderBy: "name",
	});

	const wikiItems = rows.map(normalizeEntry);

	console.log(
		`\nFetched ${wikiItems.length} ${label} from wiki; local has ${localItems.length}.\n`,
	);

	const localByName = new Map(
		localItems.map((a) => [a.name.toLowerCase(), a] as const),
	);
	const wikiByName = new Map(
		wikiItems.map((a) => [a.name.toLowerCase(), a] as const),
	);

	let matchedCount = 0;
	let descriptionDiffCount = 0;
	let dlcDiffCount = 0;
	let newCount = 0;
	let staleCount = 0;

	for (const w of wikiItems) {
		const local = localByName.get(w.name.toLowerCase());
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

	for (const l of localItems) {
		if (!wikiByName.has(l.name.toLowerCase())) {
			staleCount++;
			console.log(`- stale (local only): ${l.name}`);
		}
	}

	console.log(
		`\nSummary: ${matchedCount} matched (${descriptionDiffCount} with description diffs, ${dlcDiffCount} with dlc diffs), ${newCount} new, ${staleCount} stale.`,
	);
};

export type { SyncCategoryOptions };
export { syncWikiCategory };
