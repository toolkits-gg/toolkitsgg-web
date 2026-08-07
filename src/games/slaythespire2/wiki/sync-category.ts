/**
 * Shared comparison runner for Slay The Spire 2 wiki sync scripts.
 *
 * The slaythespire.wiki.gg wiki exposes per-category data as Lua modules at
 * `Module:<Category>/StS2 data`. Each per-category script (potions, relics,
 * ...) passes the module URL, its local item array, a `normalizeEntry`
 * function that maps a raw Lua field bag to a typed wiki item, and a
 * `compareItem` callback that diffs a matched pair and returns the field
 * names that differ plus a closure for printing per-field detail lines.
 *
 * The runner handles: fetching the module, parsing the Lua table, building
 * lookup maps, iterating wiki/local sides, printing matched / new / stale
 * lines, and rolling per-field diff counts into the final summary.
 */

import { parseLuaModule } from "#/features/sync/wiki/parse-lua-module";
import { fetchWithUserAgent } from "#/features/sync/wiki/utils";

type CompareResult = {
	differingFields: string[];
	printDetails: () => void;
};

/**
 * Reads a string field from a parsed Lua table, returning `""` if absent or
 * non-string. Cuts the repeated `typeof fields.X === "string" ? ... : ""`
 * guards out of per-category `normalizeEntry` functions.
 */
const getString = (fields: Record<string, unknown>, key: string): string =>
	typeof fields[key] === "string" ? (fields[key] as string) : "";

/**
 * Looks up `raw` in `map` and warns (to console) when the value is non-empty
 * but unmapped. `label` and `name` are used only for the warn message.
 *
 * Returns `undefined` for both "no raw input" and "unknown raw input" — call
 * sites that need `null` should `?? null` the result.
 */
const resolveMapped = <T>(
	raw: string,
	map: Record<string, T>,
	label: string,
	name: string,
): T | undefined => {
	if (!raw) return undefined;
	const value = map[raw];
	if (!value) {
		console.warn(`  ! unknown ${label} '${raw}' for ${name}`);
	}
	return value;
};

type SyncCategoryOptions<
	TLocal extends { name: string },
	TWiki extends { name: string },
> = {
	wikiUrls: string[];
	label: string;
	localItems: readonly TLocal[];
	normalizeEntry: (name: string, fields: Record<string, unknown>) => TWiki;
	compareItem: (local: TLocal, wiki: TWiki) => CompareResult;
};

type WikiSyncStats = {
	matched: number;
	new: number;
	stale: number;
	diffCounts: Map<string, number>;
};

const fetchModule = async <TWiki extends { name: string }>(
	wikiUrl: string,
	normalizeEntry: (name: string, fields: Record<string, unknown>) => TWiki,
): Promise<TWiki[]> => {
	console.log(`Fetching ${wikiUrl}\n`);
	const res = await fetchWithUserAgent(wikiUrl);
	if (!res.ok) {
		throw new Error(`Wiki fetch failed: ${res.status} ${res.statusText}`);
	}
	const parsed = parseLuaModule(await res.text());
	return Object.entries(parsed).map(([name, fields]) =>
		normalizeEntry(name, fields as Record<string, unknown>),
	);
};

const fetchWikiItems = async <TWiki extends { name: string }>(
	wikiUrls: string[],
	normalizeEntry: (name: string, fields: Record<string, unknown>) => TWiki,
): Promise<TWiki[]> => {
	const seen = new Set<string>();
	const all: TWiki[] = [];
	for (const wikiUrl of wikiUrls) {
		for (const item of await fetchModule(wikiUrl, normalizeEntry)) {
			if (seen.has(item.name)) {
				console.warn(`  ! duplicate '${item.name}' across modules — last wins`);
			}
			seen.add(item.name);
			all.push(item);
		}
	}
	return all;
};

const reportMatch = <TLocal, TWiki extends { name: string }>(
	local: TLocal,
	wiki: TWiki,
	compareItem: (local: TLocal, wiki: TWiki) => CompareResult,
	diffCounts: Map<string, number>,
): void => {
	const { differingFields, printDetails } = compareItem(local, wiki);
	for (const field of differingFields) {
		diffCounts.set(field, (diffCounts.get(field) ?? 0) + 1);
	}
	if (differingFields.length === 0) {
		console.log(`✓ matched: ${wiki.name}`);
		return;
	}
	console.log(
		`~ matched (${differingFields.join(", ")} differs): ${wiki.name}`,
	);
	printDetails();
};

const reportNew = <TWiki extends { name: string }>(wiki: TWiki): void => {
	console.log(`+ new (wiki only): ${wiki.name}`);
	console.log(JSON.stringify(wiki, null, 2));
};

const formatSummary = (stats: WikiSyncStats): string => {
	const diffSummary = Array.from(stats.diffCounts.entries())
		.map(([field, count]) => `${count} with ${field} diffs`)
		.join(", ");
	const diffPart = diffSummary ? ` (${diffSummary})` : "";
	return `Summary: ${stats.matched} matched${diffPart}, ${stats.new} new, ${stats.stale} stale.`;
};

const syncWikiCategory = async <
	TLocal extends { name: string },
	TWiki extends { name: string },
>(
	opts: SyncCategoryOptions<TLocal, TWiki>,
): Promise<void> => {
	const { wikiUrls, label, localItems, normalizeEntry, compareItem } = opts;

	const wikiItems = await fetchWikiItems(wikiUrls, normalizeEntry);
	console.log(
		`\nFetched ${wikiItems.length} ${label} from wiki; local has ${localItems.length}.\n`,
	);

	const localByName = new Map(localItems.map((p) => [p.name, p] as const));
	const wikiNames = new Set(wikiItems.map((w) => w.name));
	const stats: WikiSyncStats = {
		matched: 0,
		new: 0,
		stale: 0,
		diffCounts: new Map(),
	};

	for (const w of wikiItems) {
		const local = localByName.get(w.name);
		if (local) {
			stats.matched++;
			reportMatch(local, w, compareItem, stats.diffCounts);
		} else {
			stats.new++;
			reportNew(w);
		}
	}

	for (const l of localItems) {
		if (!wikiNames.has(l.name)) {
			stats.stale++;
			console.log(`- stale (local only): ${l.name}`);
		}
	}

	console.log(`\n${formatSummary(stats)}`);
};

export type { CompareResult, SyncCategoryOptions };
export { getString, resolveMapped, syncWikiCategory };
