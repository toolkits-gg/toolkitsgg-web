import { diffWords } from "diff";
import type {
	BuildSnapshot,
	DiffSegment,
	FieldDiff,
} from "#/features/moderation/review-diff";

/**
 * Turns a field's before and after into the runs a moderator actually reads.
 *
 * A build description runs to 5k characters of markdown, so showing both
 * versions in full means reading 10k characters to find a one-word fix. Only
 * this module imports jsdiff: the types live in `review-diff.ts` so nothing the
 * browser loads can pull the diff code in.
 */

type TextDiffOptions = {
	/** Unchanged words kept on each side of a change. */
	contextWords: number;
	suppress: boolean;
	maxSegments: number;
	/** Characters kept of a one-sided value: a create, a clear, or a rewrite. */
	maxValueChars: number;
	timeoutMs: number;
};

const DEFAULT_TEXT_DIFF_OPTIONS: TextDiffOptions = {
	contextWords: 6,
	suppress: true,
	maxSegments: 60,
	maxValueChars: 800,
	timeoutMs: 25,
};

/** Short fields are read whole, so eliding them would only cost context. */
const FIELD_DIFF_OPTIONS: Record<string, Partial<TextDiffOptions>> = {
	name: { suppress: false, maxValueChars: 200 },
	videoUrl: { suppress: false, maxValueChars: 300 },
	referenceUrl: { suppress: false, maxValueChars: 300 },
	visibility: { suppress: false, maxValueChars: 40 },
};

/**
 * Past this the diff is not worth computing: nobody reviews a 20k-character
 * rewrite word by word, and the cost grows with the product of both sides.
 */
const MAX_DIFF_INPUT_CHARS = 20_000;

/**
 * Above this share of changed words the text was replaced rather than edited,
 * and an interleaved word diff reads worse than the two versions side by side.
 */
const REWRITE_RATIO = 0.7;

/**
 * Collapsing less than this reads worse than the words themselves, and a run
 * bordered by two nearby changes can otherwise elide nothing at all.
 */
const MIN_SUPRESSED_WORDS = 4;

/** Keeps whitespace as its own token so slices rejoin with original spacing. */
const tokenize = (value: string): string[] => value.match(/\s+|\S+/g) ?? [];

const countWords = (tokens: readonly string[]): number =>
	tokens.filter((token) => token.trim() !== "").length;

const truncate = (value: string, maxChars: number): DiffSegment[] => {
	const tokens = tokenize(value);
	if (value.length <= maxChars) return [{ kind: "same", text: value }];

	let kept = "";
	for (const token of tokens) {
		if (kept.length + token.length > maxChars) break;
		kept += token;
	}
	// A single token longer than the budget leaves nothing, so cut mid-word.
	if (kept === "") kept = value.slice(0, maxChars);

	return [
		{ kind: "same", text: kept },
		{
			kind: "supressed",
			words: countWords(tokenize(value.slice(kept.length))),
		},
	];
};

const oneSided = (
	kind: "added" | "removed",
	value: string,
	maxChars: number,
): DiffSegment[] =>
	truncate(value, maxChars).map((segment) =>
		segment.kind === "same" ? { kind, text: segment.text } : segment,
	);

/**
 * Collapses an unchanged run down to the context around whatever it borders.
 *
 * The budget doubles for an interior run because both of its ends sit next to a
 * change. That is also what lets two nearby edits keep the text between them
 * whole: a short interior run fits under the budget and is never cut.
 */
const contextRun = (
	value: string,
	options: TextDiffOptions,
	position: "leading" | "trailing" | "interior",
): DiffSegment[] => {
	if (!options.suppress) return [{ kind: "same", text: value }];

	const tokens = tokenize(value);
	const keep = options.contextWords * 2;
	const budget = position === "interior" ? keep * 2 : keep;
	if (tokens.length <= budget) return [{ kind: "same", text: value }];

	const head = position === "leading" ? [] : tokens.slice(0, keep);
	const tail = position === "trailing" ? [] : tokens.slice(-keep);
	const dropped = countWords(tokens) - countWords(head) - countWords(tail);
	if (dropped < MIN_SUPRESSED_WORDS) return [{ kind: "same", text: value }];

	return [
		...(head.length > 0
			? ([{ kind: "same", text: head.join("") }] as const)
			: []),
		{ kind: "supressed", words: dropped },
		...(tail.length > 0
			? ([{ kind: "same", text: tail.join("") }] as const)
			: []),
	];
};

const capSegments = (
	segments: readonly DiffSegment[],
	maxSegments: number,
): DiffSegment[] => {
	if (segments.length <= maxSegments) return [...segments];

	const kept = segments.slice(0, maxSegments);
	const dropped = segments
		.slice(maxSegments)
		.reduce(
			(total, segment) =>
				total +
				(segment.kind === "supressed"
					? segment.words
					: countWords(tokenize(segment.text))),
			0,
		);
	return [...kept, { kind: "supressed", words: dropped }];
};

/**
 * The word-level runs between two versions, or null when no readable word diff
 * exists and the caller should fall back to showing the values themselves.
 */
const diffText = (
	before: string,
	after: string,
	options?: Partial<TextDiffOptions>,
): DiffSegment[] | null => {
	const resolved = { ...DEFAULT_TEXT_DIFF_OPTIONS, ...options };
	if (before.length + after.length > MAX_DIFF_INPUT_CHARS) return null;

	const parts = diffWords(before, after, { timeout: resolved.timeoutMs });
	if (!parts) return null;

	const total = parts.reduce((sum, part) => sum + (part.count ?? 0), 0);
	const changed = parts.reduce(
		(sum, part) => sum + (part.added || part.removed ? (part.count ?? 0) : 0),
		0,
	);
	if (total > 0 && changed / total > REWRITE_RATIO) return null;

	const segments = parts.flatMap((part, index): DiffSegment[] => {
		if (part.added) return [{ kind: "added", text: part.value }];
		if (part.removed) return [{ kind: "removed", text: part.value }];

		const isFirst = index === 0;
		const isLast = index === parts.length - 1;
		if (isFirst && isLast) return [{ kind: "same", text: part.value }];
		return contextRun(
			part.value,
			resolved,
			isFirst ? "leading" : isLast ? "trailing" : "interior",
		);
	});

	return capSegments(segments, resolved.maxSegments);
};

const diffFieldValues = (args: {
	field: string;
	before: string | null;
	after: string | null;
	hasPrevious: boolean;
}): FieldDiff => {
	const { field, hasPrevious } = args;
	const before = args.before ?? "";
	const after = args.after ?? "";
	const options = {
		...DEFAULT_TEXT_DIFF_OPTIONS,
		...FIELD_DIFF_OPTIONS[field],
	};

	// A create has nothing to diff against, so the new value is shown as-is.
	if (!hasPrevious || before === "") {
		if (after === "") return { field, mode: "unchanged", segments: [] };
		return {
			field,
			mode: "added",
			segments: oneSided("added", after, options.maxValueChars),
		};
	}

	if (after === "") {
		return {
			field,
			mode: "cleared",
			segments: oneSided("removed", before, options.maxValueChars),
		};
	}

	if (before === after) return { field, mode: "unchanged", segments: [] };

	const segments = diffText(before, after, options);
	if (!segments) {
		return {
			field,
			mode: "rewritten",
			segments: [
				...oneSided("removed", before, options.maxValueChars),
				...oneSided("added", after, options.maxValueChars),
			],
		};
	}

	// diffWords ignores whitespace when matching, so a field can differ as a raw
	// string while having no word-level change at all.
	const hasWordChange = segments.some(
		(segment) => segment.kind === "added" || segment.kind === "removed",
	);
	if (!hasWordChange) return { field, mode: "formatting", segments: [] };

	return { field, mode: "words", segments };
};

const snapshotValue = (
	snapshot: BuildSnapshot | null,
	field: string,
): string | null => {
	if (!snapshot) return null;
	const value = snapshot[field as keyof BuildSnapshot];
	return value === null || value === undefined ? null : String(value);
};

const buildFieldDiffs = (args: {
	changedFields: readonly string[];
	previous: BuildSnapshot | null;
	current: BuildSnapshot | null;
}): FieldDiff[] =>
	args.changedFields.map((field) =>
		diffFieldValues({
			field,
			before: snapshotValue(args.previous, field),
			after: snapshotValue(args.current, field),
			hasPrevious: args.previous !== null,
		}),
	);

export type { TextDiffOptions };
export { buildFieldDiffs };
