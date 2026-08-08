// Client-safe: no `@/prisma` import at module scope, so the admin UI can render
// a diff with the same field list the server files one from.

/**
 * The fields a moderator actually reviews. Loadout and item changes are not
 * moderatable content, so re-arranging a build files no review work.
 */
const MODERATABLE_BUILD_FIELDS = [
	"name",
	"description",
	"videoUrl",
	"referenceUrl",
] as const;

type ModeratableField =
	| (typeof MODERATABLE_BUILD_FIELDS)[number]
	| "visibility";

/**
 * A run of a field's text as a moderator sees it. `supressed` stands in for
 * unchanged text that was collapsed away, carrying only how much was dropped.
 */
type DiffSegment =
	| { kind: "same" | "added" | "removed"; text: string }
	| { kind: "supressed"; words: number };

/**
 * How a field's change is presented. Everything but `words` is a case where an
 * inline word diff would be noise or a lie: `added` and `cleared` have only one
 * side, `rewritten` changed too much to interleave readably, and `unchanged` and
 * `formatting` are fields that differ as raw strings but not as prose.
 */
type FieldDiffMode =
	| "words"
	| "added"
	| "cleared"
	| "rewritten"
	| "unchanged"
	| "formatting";

type FieldDiff = {
	field: string;
	mode: FieldDiffMode;
	segments: DiffSegment[];
};

type BuildSnapshot = {
	name: string | null;
	description: string | null;
	videoUrl: string | null;
	referenceUrl: string | null;
	visibility: string;
};

/** PRIVATE content is invisible to everyone but its owner, so it needs no review. */
const needsReview = (visibility: string): boolean => visibility !== "PRIVATE";

/**
 * Which moderatable fields differ from the state a moderator last saw. Passing
 * null for `previous` means nobody has reviewed this build yet, so every
 * populated field is unseen.
 *
 * Visibility is deliberately absent: it gates whether the diff is taken at all
 * (`needsReview`) rather than counting as a change in its own right. Treating it
 * as a field made a republish report only "visibility" while the edits made
 * during the private window compared equal against each other and vanished.
 */
const diffModeratableFields = (
	previous: BuildSnapshot | null,
	next: BuildSnapshot,
): ModeratableField[] => {
	if (!previous) {
		return MODERATABLE_BUILD_FIELDS.filter(
			(field) => next[field] !== null && next[field] !== "",
		);
	}

	return MODERATABLE_BUILD_FIELDS.filter(
		(field) => (previous[field] ?? null) !== (next[field] ?? null),
	);
};

export type {
	BuildSnapshot,
	DiffSegment,
	FieldDiff,
	FieldDiffMode,
	ModeratableField,
};
export { diffModeratableFields, needsReview };
