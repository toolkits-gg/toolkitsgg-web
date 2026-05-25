/**
 * Shared comparison runner for Remnant2 wiki sync scripts.
 *
 * Each per-category script (rings, amulets, ...) passes an array of entries —
 * each entry pairing a local item array with the Cargo `class` filter that
 * surfaces those items on the wiki. The runner unions the entries' classes
 * into a single `items.class IN (...)` Cargo query, aggregates the local
 * arrays into one case-insensitive map, and prints matched / new / stale
 * diffs against the merged set.
 *
 * Multi-entry usage lets one local category (e.g. `Consumables`) be checked
 * against the union of multiple wiki classes (e.g. `Consumable` + `Curative`)
 * without each unrelated class polluting the diff as "stale".
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
	entries: readonly SyncCategoryOptions<TItem>[],
): Promise<void> => {
	if (entries.length === 0) {
		throw new Error("syncWikiCategory requires at least one entry");
	}

	const combinedLabel = entries.map((e) => e.label).join(" + ");
	const inClause = entries.map((e) => `"${e.category}"`).join(",");

	console.log(
		`Fetching ${combinedLabel} via cargoquery from ${WIKI_API_URL}\n`,
	);

	const rows = await cargoQueryAll<CargoItemRow>({
		apiUrl: WIKI_API_URL,
		tables: "items",
		fields: "items._pageName=page,name,image,require_dlc=dlc,description",
		where: `items.class IN (${inClause})`,
		orderBy: "name",
	});

	const wikiItems = rows.map(normalizeEntry);

	const localByName = new Map<string, TItem>();
	for (const entry of entries) {
		for (const item of entry.localItems) {
			localByName.set(item.name.toLowerCase(), item);
		}
	}

	console.log(
		`\nFetched ${wikiItems.length} ${combinedLabel} from wiki; local has ${localByName.size}.\n`,
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

	for (const l of localByName.values()) {
		if (!wikiByName.has(l.name.toLowerCase())) {
			staleCount++;
			console.log(`- stale (local only): ${l.name}`);
		}
	}

	console.log(
		`\nSummary (${combinedLabel}): ${matchedCount} matched (${descriptionDiffCount} with description diffs, ${dlcDiffCount} with dlc diffs), ${newCount} new, ${staleCount} stale.`,
	);
};

export type { SyncCategoryOptions };
export { syncWikiCategory };
