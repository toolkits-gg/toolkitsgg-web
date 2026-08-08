import type { BuildLoadoutEntry } from "#/features/game/data/types";

/**
 * Serializes a loadout into a URL-safe string so a build can be shared without
 * ever being saved to the server.
 *
 * `~ . * !` are the delimiters because `encodeURIComponent` leaves all four
 * alone, so the encoded loadout rides in the query string unescaped. Item ids
 * are alphanumeric, which is what keeps them unambiguous.
 *
 *   id[~level][*amount][!]  joined by "."
 */

const ENTRY_SEPARATOR = ".";
const MAX_LOADOUT_ENTRIES = 200;

const ENTRY_PATTERN = /^([A-Za-z0-9]+)(?:~(\d+))?(?:\*(\d+))?(!)?$/;

const encodeEntry = (entry: BuildLoadoutEntry): string => {
	let out = entry.itemId;
	// Prisma defaults `level` to 1, so an undefined level and a level of 1 are
	// the same build at rest and neither needs to take up room in the URL.
	if (entry.level !== undefined && entry.level !== 1) out += `~${entry.level}`;
	if (entry.amount !== undefined && entry.amount !== null) {
		out += `*${entry.amount}`;
	}
	if (entry.optional) out += "!";
	return out;
};

const encodeLoadout = (entries: BuildLoadoutEntry[]): string =>
	entries
		.slice(0, MAX_LOADOUT_ENTRIES)
		.filter((entry) => /^[A-Za-z0-9]+$/.test(entry.itemId))
		.map(encodeEntry)
		.join(ENTRY_SEPARATOR);

const decodeEntry = (segment: string): BuildLoadoutEntry | null => {
	const match = ENTRY_PATTERN.exec(segment);
	if (!match) return null;

	const [, itemId, level, amount, optional] = match;
	const entry: BuildLoadoutEntry = { itemId, level: level ? Number(level) : 1 };
	if (amount) entry.amount = Number(amount);
	if (optional) entry.optional = true;
	return entry;
};

/**
 * Malformed segments are dropped rather than thrown on: a link mangled by a
 * chat client should render the build it can still make out.
 */
const decodeLoadout = (raw: string | null | undefined): BuildLoadoutEntry[] => {
	if (!raw) return [];

	const seen = new Set<string>();
	const entries: BuildLoadoutEntry[] = [];
	for (const segment of raw.split(ENTRY_SEPARATOR)) {
		if (entries.length >= MAX_LOADOUT_ENTRIES) break;
		const entry = decodeEntry(segment);
		// An item can only appear once per build (Remnant2BuildItem's composite
		// primary key), so a duplicated id in a hand-edited link is dropped.
		if (!entry || seen.has(entry.itemId)) continue;
		seen.add(entry.itemId);
		entries.push(entry);
	}
	return entries;
};

export { decodeLoadout, encodeLoadout };
