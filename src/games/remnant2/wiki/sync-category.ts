/**
 * Shared runner for Remnant2 wiki sync scripts.
 *
 * Each per-category script (rings, mutators, ...) calls this with one or more
 * entries pairing a local item array with the Cargo `class` that surfaces
 * those items on the wiki. Entries that share the same join shape
 * (`extraTables`/`extraFields`/`joinOn`) are batched into one cargo query;
 * entries with different join shapes issue separate queries. The runner
 * matches wiki rows to local items by name (case-insensitive) and prints a
 * matched / new / stale diff to the terminal.
 *
 * By default it diffs the wiki `description` column against `local.description`.
 * Categories that need to project additional or nested local fields pass a
 * `mapWikiFields` callback returning a `Record<string, unknown>`; each key is
 * then diffed against the same-named local field (dot-paths like
 * `"modifiers.armor"` are walked into nested local objects).
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

type CargoRowWithExtras = CargoItemRow &
	Record<string, string | number | boolean | null>;

type WikiFieldMap = Record<string, unknown>;

type MapWikiFields = (lines: string[], row: CargoRowWithExtras) => WikiFieldMap;

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
	 * Extra cargo tables to join against `items`. Entries that share the same
	 * `(extraTables, extraFields, joinOn)` triple are batched into one query.
	 */
	extraTables?: string;
	/**
	 * Extra field projections appended to the items query (comma-separated, in
	 * cargo syntax — e.g. `"armor.armor_set=set,armor,weight"`).
	 */
	extraFields?: string;
	/** Cargo `join_on` clause, e.g. `"items.item_id=armor.item_id"`. */
	joinOn?: string;
	/**
	 * Maps the cleaned wiki line array (and full raw row, including any
	 * extraFields columns) into one-or-more local-shaped fields. Keys with a
	 * dot are read as paths into nested local objects (e.g. `"modifiers.armor"`).
	 * Defaults to `{ description: lines }`.
	 */
	mapWikiFields?: MapWikiFields;
};

const defaultMap: MapWikiFields = (lines) => ({
	description: lines,
});

const normalizeEntry = (
	row: CargoRowWithExtras,
	map: MapWikiFields,
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
		fields: map(cleanCargoHtml(row.description ?? ""), row),
	};
};

type DiffStats = {
	matchedCount: number;
	dlcDiffCount: number;
	newCount: number;
	staleCount: number;
	fieldDiffCounts: Map<string, number>;
};

const getByPath = (obj: unknown, path: string): unknown =>
	path
		.split(".")
		.reduce<unknown>(
			(acc, key) =>
				acc == null ? undefined : (acc as Record<string, unknown>)[key],
			obj,
		);

const diffWikiItem = <TItem extends LocalItemBase>(
	w: WikiItem,
	local: TItem,
	stats: DiffStats,
): void => {
	stats.matchedCount++;
	const diffs: string[] = [];
	const fieldComparisons: Array<{
		key: string;
		localJson: string;
		wikiJson: string;
	}> = [];

	for (const [key, wikiValue] of Object.entries(w.fields)) {
		const wikiJson = JSON.stringify(wikiValue);
		const localJson = JSON.stringify(getByPath(local, key));
		if (localJson !== wikiJson) {
			stats.fieldDiffCounts.set(key, (stats.fieldDiffCounts.get(key) ?? 0) + 1);
			diffs.push(key);
			fieldComparisons.push({ key, localJson, wikiJson });
		}
	}

	if (w.dlc && local.dlc !== w.dlc) {
		stats.dlcDiffCount++;
		diffs.push("dlc");
	}

	if (diffs.length === 0) {
		console.log(`✓ matched: ${w.name}`);
		return;
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
};

const buildMapByCategory = <TItem extends LocalItemBase>(
	entries: readonly SyncCategoryOptions<TItem>[],
): Map<string, MapWikiFields> => {
	const mapByCategory = new Map<string, MapWikiFields>();
	for (const entry of entries) {
		mapByCategory.set(entry.category, entry.mapWikiFields ?? defaultMap);
	}
	return mapByCategory;
};

const buildLocalByName = <TItem extends LocalItemBase>(
	entries: readonly SyncCategoryOptions<TItem>[],
): Map<string, TItem> => {
	const localByName = new Map<string, TItem>();
	for (const entry of entries) {
		for (const item of entry.localItems) {
			localByName.set(item.name.toLowerCase(), item);
		}
	}
	return localByName;
};

const groupEntriesByJoinShape = <TItem extends LocalItemBase>(
	entries: readonly SyncCategoryOptions<TItem>[],
): Map<string, SyncCategoryOptions<TItem>[]> => {
	const groups = new Map<string, SyncCategoryOptions<TItem>[]>();
	for (const entry of entries) {
		const key = `${entry.extraTables ?? ""}|${entry.extraFields ?? ""}|${entry.joinOn ?? ""}`;
		const existing = groups.get(key);
		if (existing) {
			existing.push(entry);
		} else {
			groups.set(key, [entry]);
		}
	}
	return groups;
};

const fetchGroup = async <TItem extends LocalItemBase>(
	group: readonly SyncCategoryOptions<TItem>[],
): Promise<WikiItem[]> => {
	const first = group[0];
	if (!first) return [];
	const inClause = group.map((e) => `"${e.category}"`).join(",");
	const mapByCategory = buildMapByCategory(group);

	const tables = first.extraTables ? `items,${first.extraTables}` : "items";
	const fields = first.extraFields
		? `items._pageName=page,name,image,require_dlc=dlc,description,class,${first.extraFields}`
		: "items._pageName=page,name,image,require_dlc=dlc,description,class";

	const rows = await cargoQueryAll<CargoRowWithExtras>({
		apiUrl: WIKI_API_URL,
		tables,
		fields,
		where: `items.class IN (${inClause})`,
		orderBy: "name",
		joinOn: first.joinOn,
	});

	return rows.map((row) => {
		const map = mapByCategory.get(row.class) ?? defaultMap;
		return normalizeEntry(row, map);
	});
};

const fetchWikiItems = async <TItem extends LocalItemBase>(
	entries: readonly SyncCategoryOptions<TItem>[],
	combinedLabel: string,
): Promise<WikiItem[]> => {
	console.log(
		`Fetching ${combinedLabel} via cargoquery from ${WIKI_API_URL}\n`,
	);

	const groups = groupEntriesByJoinShape(entries);
	const all: WikiItem[] = [];
	for (const group of groups.values()) {
		const items = await fetchGroup(group);
		all.push(...items);
	}
	return all;
};

const diffAllItems = <TItem extends LocalItemBase>(
	wikiItems: WikiItem[],
	localByName: Map<string, TItem>,
): DiffStats => {
	const wikiByName = new Map(
		wikiItems.map((a) => [a.name.toLowerCase(), a] as const),
	);
	const stats: DiffStats = {
		matchedCount: 0,
		dlcDiffCount: 0,
		newCount: 0,
		staleCount: 0,
		fieldDiffCounts: new Map(),
	};

	for (const w of wikiItems) {
		const local = localByName.get(w.name.toLowerCase());
		if (!local) {
			stats.newCount++;
			console.log(`+ new (wiki only): ${w.name}`);
			console.log(`${JSON.stringify(w, null, 2)}`);
			continue;
		}
		diffWikiItem(w, local, stats);
	}

	for (const l of localByName.values()) {
		if (!wikiByName.has(l.name.toLowerCase())) {
			stats.staleCount++;
			console.log(`- stale (local only): ${l.name}`);
		}
	}

	return stats;
};

const printSummary = (combinedLabel: string, stats: DiffStats): void => {
	const { matchedCount, dlcDiffCount, newCount, staleCount, fieldDiffCounts } =
		stats;
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

const syncWikiCategory = async <TItem extends LocalItemBase>(
	entries: readonly SyncCategoryOptions<TItem>[],
): Promise<void> => {
	if (entries.length === 0) {
		throw new Error("syncWikiCategory requires at least one entry");
	}

	const combinedLabel = entries.map((e) => e.label).join(" + ");
	const wikiItems = await fetchWikiItems(entries, combinedLabel);
	const localByName = buildLocalByName(entries);

	console.log(
		`\nFetched ${wikiItems.length} ${combinedLabel} from wiki; local has ${localByName.size}.\n`,
	);

	const stats = diffAllItems(wikiItems, localByName);
	printSummary(combinedLabel, stats);
};

export type { SyncCategoryOptions };
export { syncWikiCategory };
