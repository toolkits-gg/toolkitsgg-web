/**
 * Converts raw wiki markup into the `description: string[]` the app stores.
 *
 * Templates, keyword links, and icon tokens only render inside the wiki's own
 * skin, so each has to be resolved to plain text here rather than at display
 * time. Every resolved label is capitalized: these are special terms, and the
 * source sometimes stores the plural slot lowercased.
 */
import { stripOmitTokens } from "#/features/sync/wiki/omit-tokens";
import { capitalize } from "#/utils";

type IconTokenEntry =
	| { kind: "countable"; singular: string; plural: string }
	| { kind: "noun"; word: string };

const ICON_TOKEN_MAP: Record<string, IconTokenEntry> = {
	"@CE": { kind: "countable", singular: "Energy", plural: "Energy" },
	"@ST": { kind: "countable", singular: "Star", plural: "Stars" },
	"@Gold": { kind: "noun", word: "Gold" },
	"type:Power": { kind: "noun", word: "Power" },
	"type:Skill": { kind: "noun", word: "Skill" },
	"type:Attack": { kind: "noun", word: "Attack" },
	"color:Colorless": { kind: "noun", word: "Colorless" },
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Build the matcher from the map so that map is source of truth.
// Sorted longest-first so a longer key can't be shadowed by a shorter prefix.
const ICON_TOKEN_REGEX = new RegExp(
	`(${Object.keys(ICON_TOKEN_MAP)
		.sort((a, b) => b.length - a.length)
		.map(escapeRegex)
		.join("|")})(?:\\s*\\1)*`,
	"g",
);

const splitOnLineBreaks = (text: string): string[] => {
	return text
		.split(/<br\s*\/?>/i)
		.map((s) => s.trim())
		.filter((s) => s.length > 0);
};

const isCount = (value: string): boolean => /^\d+$/.test(value);

/** `{{count|plural|singular}}`, e.g. `{{2|potions|Potion}}` -> "Potions". */
const countFirstForm = (parts: string[]): string | undefined => {
	if (parts.length !== 3 || !isCount(parts[0])) return undefined;

	const [count, plural, singular] = parts;
	return Number.parseInt(count, 10) === 1
		? singular || plural
		: plural || singular;
};

/**
 * `{{C|singular|plural|count}}` and `{{QueryLink|category|singular|plural|count}}`.
 * The trailing count only identifies the shape: the plural is taken either way,
 * and the singular stands in when the plural slot is empty.
 */
const countLastLabel = (parts: string[]): string | undefined => {
	if (parts.length < 4 || !isCount(parts[parts.length - 1])) return undefined;

	return parts[parts.length - 2] || parts[parts.length - 3];
};

/** Every other template: the last arg is the display label. */
const trailingLabel = (parts: string[]): string =>
	parts[parts.length - 1] || parts[parts.length - 2];

/** Every recognized shape reads three args, so a gap in them means no match. */
const hasCompleteLeadingArgs = (parts: string[]): boolean =>
	Boolean(parts[0] && parts[1] && parts[2]);

const collapseTemplates = (text: string): string =>
	text.replace(/\{\{([^{}]+)}}/g, (match: string, inner: string) => {
		const parts = inner.split("|").map((part) => part.trim());

		if (parts.length < 2) {
			console.warn(`  ! single-arg template not converted: ${match}`);
			return match;
		}
		if (!hasCompleteLeadingArgs(parts)) {
			console.warn(`  ! empty template arg: ${match}`);
			return match;
		}

		return capitalize(
			countFirstForm(parts) ?? countLastLabel(parts) ?? trailingLabel(parts),
		);
	});

/** `$Word` -> `Word`, a single bareword with apostrophes allowed. */
const expandKeywordLinks = (text: string): string =>
	text.replace(/\$([A-Za-z][\w']*)/g, (_match, word: string) =>
		capitalize(word),
	);

/** The number the text already ends on, e.g. the "0" of "costs 0 @CE". */
const trailingNumber = (text: string): number | undefined => {
	const match = text.trimEnd().match(/(\d+)$/);
	return match ? Number.parseInt(match[1], 10) : undefined;
};

const expandIconTokens = (text: string): string =>
	text.replace(
		ICON_TOKEN_REGEX,
		(match: string, token: string, offset: number, full: string) => {
			const entry = ICON_TOKEN_MAP[token];
			if (entry.kind === "noun") return capitalize(entry.word);

			const precedingCount = trailingNumber(full.slice(0, offset));
			if (precedingCount !== undefined) {
				return capitalize(precedingCount === 1 ? entry.singular : entry.plural);
			}

			const repeats = match.split(token).length - 1;
			return `${repeats} ${capitalize(repeats > 1 ? entry.plural : entry.singular)}`;
		},
	);

const collapseWhitespace = (text: string): string =>
	text.replace(/\s+/g, " ").trim();

const warnOnUnresolvedTemplates = (text: string): void => {
	if (/\{\{/.test(text)) {
		console.warn(`  ! template syntax remains after pass: ${text}`);
	}
};

/** So a wiki token nobody has mapped yet gets noticed rather than passed through. */
const warnOnUnknownIconTokens = (text: string): void => {
	for (const token of text.match(/@[A-Z]\w*/g) ?? []) {
		console.warn(`  ! unknown icon token '${token}' left as-is`);
	}
};

const cleanWikiTags = (text: string): string => {
	const withoutTemplates = collapseTemplates(text);
	warnOnUnresolvedTemplates(withoutTemplates);

	const withoutTokens = expandIconTokens(expandKeywordLinks(withoutTemplates));
	warnOnUnknownIconTokens(withoutTokens);

	return collapseWhitespace(stripOmitTokens(withoutTokens));
};

const cleanWikiText = (text: string): string[] => {
	return splitOnLineBreaks(text).map(cleanWikiTags);
};

/**
 * Similar to splitOnLineBreaks, but only splits on a <br> that lives at the top level.
 * A <br> inside a `[base|upgraded]` upgrade token is left in
 * place so the token is not torn across array elements.
 */
const splitOnTopLevelLineBreaks = (text: string): string[] => {
	const segments: string[] = [];
	let depth = 0;
	let current = "";

	for (let i = 0; i < text.length; i++) {
		const char = text[i];
		if (char === "[") {
			depth++;
			current += char;
			continue;
		}
		if (char === "]") {
			if (depth > 0) depth--;
			current += char;
			continue;
		}
		if (depth === 0 && char === "<") {
			const brMatch = /^<br\s*\/?>/i.exec(text.slice(i));
			if (brMatch) {
				segments.push(current);
				current = "";
				i += brMatch[0].length - 1;
				continue;
			}
		}
		current += char;
	}
	segments.push(current);

	return segments.map((s) => s.trim()).filter((s) => s.length > 0);
};

/**
 * Variant of cleanWikiText that preserves `[base|upgraded]` upgrade tokens.
 * Top-level <br> become separate array elements (as usual); a <br> *inside* a
 * token is converted to `\n` so a single variant can still introduce a line
 * break.
 */
const cleanWikiTextPreservingTokens = (text: string): string[] => {
	return splitOnTopLevelLineBreaks(text).map((segment) =>
		cleanWikiTags(segment).replace(/<br\s*\/?>/gi, "\n"),
	);
};

export { cleanWikiText, cleanWikiTextPreservingTokens, splitOnLineBreaks };
