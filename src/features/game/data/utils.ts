import type {
	BuildLoadoutEntry,
	BuildRelationFields,
	BuildWriteFields,
} from "#/features/game/data/types";

const BUILD_WRITE_KEYS = [
	"name",
	"description",
	"visibility",
	"videoUrl",
	"imageUrl",
	"imagePositionX",
	"imagePositionY",
	"imageFit",
	"thumbnailUrl",
	"referenceUrl",
	"gameVersion",
] as const;

/**
 * The feed name meaning "every public build", as opposed to a game's curated feed
 * names. Lowercase so it cannot collide with a curated feed name.
 */
const COMMUNITY_FEED = "community";

/**
 * Normalises a timestamp read back from either backend into the ISO string the
 * pending-ops queue stores as `serverUpdatedAt`. Prisma hands back a `Date`,
 * IndexedDB hands back whatever was written, and an absent row yields undefined.
 */
const toIso = (value: Date | string | null | undefined): string | undefined =>
	value instanceof Date ? value.toISOString() : (value ?? undefined);

/**
 * Picks only the defined build-write fields from an input object (drops `buildId`,
 * `loadout`, `tags`, undefined). The result is passed straight to Prisma as `data`,
 * so relation fields must never survive this filter.
 */
const extractBuildWriteFields = (
	input: Record<string, unknown>,
): BuildWriteFields => {
	const out: Record<string, unknown> = {};
	for (const key of BUILD_WRITE_KEYS) {
		if (input[key] !== undefined) out[key] = input[key];
	}
	return out as BuildWriteFields;
};

/**
 * Picks the relation-backed build fields, which are written as separate join
 * rows rather than columns. Left undefined when absent so a patch-style update
 * can distinguish "not edited" from "cleared to empty".
 */
const extractBuildRelations = (
	input: Record<string, unknown>,
): BuildRelationFields => {
	const out: BuildRelationFields = {};
	if (Array.isArray(input.loadout)) {
		out.loadout = input.loadout as BuildLoadoutEntry[];
	}
	if (Array.isArray(input.tags)) {
		out.tags = input.tags as string[];
	}
	return out;
};

/**
 * Resolves a requested member order against the collection's actual members.
 * Ids the collection does not contain are dropped, and members the request left
 * out keep their existing relative order at the end, so a client working from a
 * stale read can reorder without orphaning rows it never knew about.
 *
 * Shared by the server write and the IndexedDB write so the two backends assign
 * the same positions to the same request.
 */
const resolveBuildOrder = (
	currentIds: string[],
	requestedIds: string[],
): string[] => {
	const current = new Set(currentIds);
	const ordered: string[] = [];
	const placed = new Set<string>();

	for (const id of requestedIds) {
		if (!current.has(id) || placed.has(id)) continue;
		placed.add(id);
		ordered.push(id);
	}
	for (const id of currentIds) {
		if (placed.has(id)) continue;
		placed.add(id);
		ordered.push(id);
	}
	return ordered;
};

export {
	COMMUNITY_FEED,
	extractBuildRelations,
	extractBuildWriteFields,
	resolveBuildOrder,
	toIso,
};
