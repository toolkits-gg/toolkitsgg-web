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

import { parseLuaModule } from "#/features/wiki-sync/parse-lua-module";
import { fetchWithUserAgent } from "#/features/wiki-sync/utils";

type CompareResult = {
	differingFields: string[];
	printDetails: () => void;
};

type SyncCategoryOptions<
	TLocal extends { name: string },
	TWiki extends { name: string },
> = {
	wikiUrl: string;
	label: string;
	localItems: readonly TLocal[];
	normalizeEntry: (name: string, fields: Record<string, unknown>) => TWiki;
	compareItem: (local: TLocal, wiki: TWiki) => CompareResult;
};

const syncWikiCategory = async <
	TLocal extends { name: string },
	TWiki extends { name: string },
>(
	opts: SyncCategoryOptions<TLocal, TWiki>,
): Promise<void> => {
	const { wikiUrl, label, localItems, normalizeEntry, compareItem } = opts;

	console.log(`Fetching ${wikiUrl}\n`);
	const res = await fetchWithUserAgent(wikiUrl);
	if (!res.ok) {
		throw new Error(`Wiki fetch failed: ${res.status} ${res.statusText}`);
	}
	const raw = await res.text();

	const parsed = parseLuaModule(raw);
	const wikiItems: TWiki[] = Object.entries(parsed).map(([name, fields]) =>
		normalizeEntry(name, fields as Record<string, unknown>),
	);

	console.log(
		`\nFetched ${wikiItems.length} ${label} from wiki; local has ${localItems.length}.\n`,
	);

	const localByName = new Map(localItems.map((p) => [p.name, p] as const));
	const wikiByName = new Map(wikiItems.map((p) => [p.name, p] as const));

	let matchedCount = 0;
	let newCount = 0;
	let staleCount = 0;
	const diffCounts = new Map<string, number>();

	for (const w of wikiItems) {
		const local = localByName.get(w.name);
		if (!local) {
			newCount++;
			console.log(`+ new (wiki only): ${w.name}`);
			console.log(`${JSON.stringify(w, null, 2)}`);
			continue;
		}

		matchedCount++;
		const { differingFields, printDetails } = compareItem(local, w);

		for (const field of differingFields) {
			diffCounts.set(field, (diffCounts.get(field) ?? 0) + 1);
		}

		if (differingFields.length === 0) {
			console.log(`✓ matched: ${w.name}`);
			continue;
		}

		console.log(`~ matched (${differingFields.join(", ")} differs): ${w.name}`);
		printDetails();
	}

	for (const l of localItems) {
		if (!wikiByName.has(l.name)) {
			staleCount++;
			console.log(`- stale (local only): ${l.name}`);
		}
	}

	const diffSummary = Array.from(diffCounts.entries())
		.map(([field, count]) => `${count} with ${field} diffs`)
		.join(", ");
	const diffPart = diffSummary ? ` (${diffSummary})` : "";

	console.log(
		`\nSummary: ${matchedCount} matched${diffPart}, ${newCount} new, ${staleCount} stale.`,
	);
};

export type { CompareResult, SyncCategoryOptions };
export { syncWikiCategory };
