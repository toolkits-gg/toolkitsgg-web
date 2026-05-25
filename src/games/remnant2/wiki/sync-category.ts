/**
 * Shared runner for Remnant2 wiki sync scripts.
 *
 * Each per-category script (rings, mutators, ...) calls this with one or more
 * entries pairing a local item array with the Cargo `class` that surfaces
 * those items on the wiki. The runner fetches all classes in a single query,
 * matches wiki rows to local items by name (case-insensitive), and prints a
 * matched / new / stale diff to the terminal.
 *
 * By default it diffs the wiki `description` column against `local.description`.
 * Categories that split the wiki description across multiple local fields
 * (e.g. mutators with `description` + `maxLevelBonus`) pass a `splitWikiArray`
 * callback returning a `Record<string, string[]>`; each key is then diffed
 * against the same-named local field.
 */

import { cargoQueryAll } from "#/features/wiki-sync/cargo-query";
import { cleanCargoHtml } from "#/features/wiki-sync/clean-cargo-html";
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
	class: string;
};

type WikiFieldMap = Record<string, string[]>;

type WikiItem = {
	name: string;
	page: string;
	image: string;
	fields: WikiFieldMap;
	dlc: Remnant2DLC | undefined;
};

type LocalItemBase = {
	name: string;
	dlc: Remnant2DLC;
};

type SyncCategoryOptions<TItem extends LocalItemBase> = {
	category: string;
	label: string;
	localItems: readonly TItem[];
	/**
	 * Maps the cleaned wiki line array into one-or-more local-shaped fields.
	 * Defaults to `{ description: lines }` — every line is treated as part of
	 * the local `description` array.
	 */
	splitWikiArray?: (lines: string[]) => WikiFieldMap;
};

const defaultSplit = (lines: string[]): WikiFieldMap => ({
	description: lines,
});

const normalizeEntry = (
	row: CargoItemRow,
	split: (lines: string[]) => WikiFieldMap,
): WikiItem => {
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
		fields: split(cleanCargoHtml(row.description ?? "")),
	};
};

const syncWikiCategory = async <TItem extends LocalItemBase>(
	entries: readonly SyncCategoryOptions<TItem>[],
): Promise<void> => {
	if (entries.length === 0) {
		throw new Error("syncWikiCategory requires at least one entry");
	}

	const combinedLabel = entries.map((e) => e.label).join(" + ");
	const inClause = entries.map((e) => `"${e.category}"`).join(",");
	const splitByCategory = new Map<string, (lines: string[]) => WikiFieldMap>();
	for (const entry of entries) {
		splitByCategory.set(entry.category, entry.splitWikiArray ?? defaultSplit);
	}

	console.log(
		`Fetching ${combinedLabel} via cargoquery from ${WIKI_API_URL}\n`,
	);

	const rows = await cargoQueryAll<CargoItemRow>({
		apiUrl: WIKI_API_URL,
		tables: "items",
		fields: "items._pageName=page,name,image,require_dlc=dlc,description,class",
		where: `items.class IN (${inClause})`,
		orderBy: "name",
	});

	const wikiItems = rows.map((row) => {
		const split = splitByCategory.get(row.class) ?? defaultSplit;
		return normalizeEntry(row, split);
	});

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
	let dlcDiffCount = 0;
	let newCount = 0;
	let staleCount = 0;
	const fieldDiffCounts = new Map<string, number>();

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
		const localView = local as unknown as Record<string, unknown>;
		const fieldComparisons: Array<{
			key: string;
			localJson: string;
			wikiJson: string;
		}> = [];

		for (const [key, wikiValue] of Object.entries(w.fields)) {
			const wikiJson = JSON.stringify(wikiValue);
			const localJson = JSON.stringify(localView[key]);
			if (localJson !== wikiJson) {
				fieldDiffCounts.set(key, (fieldDiffCounts.get(key) ?? 0) + 1);
				diffs.push(key);
				fieldComparisons.push({ key, localJson, wikiJson });
			}
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
		for (const { key, localJson, wikiJson } of fieldComparisons) {
			console.log(`    ${key} local: ${localJson}`);
			console.log(`    ${key} wiki:  ${wikiJson}`);
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

	const fieldDiffSummary =
		fieldDiffCounts.size > 0
			? Array.from(fieldDiffCounts.entries())
					.map(([key, count]) => `${count} ${key}`)
					.join(", ")
			: "0 field";
	console.log(
		`\nSummary (${combinedLabel}): ${matchedCount} matched (${fieldDiffSummary} diffs, ${dlcDiffCount} dlc diffs), ${newCount} new, ${staleCount} stale.`,
	);
};

export type { SyncCategoryOptions };
export { syncWikiCategory };
