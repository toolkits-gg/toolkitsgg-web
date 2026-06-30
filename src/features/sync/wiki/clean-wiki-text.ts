// Helpers for converting raw wiki markup into `description: string[]`
//
// - splitOnLineBreaks: split on <br>, <br/>, <br /> (case-insensitive),
//   trim segments, drop empties.
// - cleanWikiTags: collapse `{{a|b|...}}` templates (prefer plural form
//   when the template has one, otherwise the singular display arg),
//   strip leading `$` from keyword links, expand @-icon tokens. Every
//   resolved tag gets its first letter capitalized — tags are special
//   terms and the source sometimes stores the plural slot lowercased.
// - cleanWikiText: splitOnLineBreaks composed with cleanWikiTags.
import { stripOmitTokens } from "#/features/sync/wiki/omit-tokens.ts";
import { capitalize } from "#/utils.ts";

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

const cleanWikiTags = (text: string): string => {
	let result = text;

	// 1. Collapse `{{...}}` templates. Two shapes are recognized:
	//
	//         Count-first plural picker — 3 args:
	//           {{count|plural|singular}}
	//           e.g. {{2|potions|Potion}} -> "Potions" (count=2 -> plural)
	//           e.g. {{1|potions|Potion}} -> "Potion" (count=1 -> singular)
	//           e.g. {{2|Rest Sites|Rest Site}} -> "Rest Sites"
	//
	//         Count-last label picker — used by C / QueryLink:
	//           {{C|singular|plural|count}} - 3 args
	//           {{QueryLink|category|singular|plural|count}} - 4 args
	//           When the last arg is a numeric count, take the plural
	//           (last-1) and fall back to singular (last-2) if plural is
	//           empty (e.g. `{{C|Byrd Swoop||2}}`).
	//
	//         Otherwise: treat the last arg as the display label.
	result = result.replace(/\{\{([^{}]+)}}/g, (match, inner: string) => {
		const parts = inner.split("|").map((p) => p.trim());
		if (parts.length < 2) {
			console.warn(`  ! single-arg template not converted: ${match}`);
			return match;
		}

		if (!parts[0] || !parts[1] || !parts[2]) {
			console.warn(`  ! empty template arg: ${match}`);
			return match;
		}

		const first = parts[0];
		if (/^\d+$/.test(first) && parts.length === 3) {
			const count = Number.parseInt(first, 10);
			const plural = parts[1];
			const singular = parts[2];
			const chosen = count === 1 ? singular || plural : plural || singular;
			return capitalize(chosen);
		}
		const last = parts[parts.length - 1];
		if (/^\d+$/.test(last) && parts.length >= 4) {
			return capitalize(parts[parts.length - 2] || parts[parts.length - 3]);
		}
		return capitalize(parts[parts.length - 1] || parts[parts.length - 2]);
	});

	// Warn about any remaining nested or unbalanced templates.
	if (/\{\{/.test(result)) {
		console.warn(`  ! template syntax remains after pass: ${result}`);
	}

	// 2. $Word -> Word (single bareword only - apostrophes allowed).
	result = result.replace(/\$([A-Za-z][\w']*)/g, (_m, word: string) =>
		capitalize(word),
	);

	// 3. Replace tokens registered in ICON_TOKEN_MAP. Countable entries
	//       (@CE / @ST) expand to "<count> <icon-name>": consecutive repeats
	//       are collapsed, and a preceding number in the surrounding text
	//       (e.g. "costs 0 @CE") is reused instead of prepending one. Noun
	//       entries (@Gold, type:Attack) emit the word as-is.
	result = result.replace(
		ICON_TOKEN_REGEX,
		(match: string, token: string, offset: number, full: string) => {
			const entry = ICON_TOKEN_MAP[token];
			if (entry.kind === "noun") {
				return capitalize(entry.word);
			}
			const before = full.slice(0, offset).trimEnd();
			const precedingNumber = before.match(/(\d+)$/);
			if (precedingNumber) {
				const prev = Number.parseInt(precedingNumber[1], 10);
				return capitalize(prev === 1 ? entry.singular : entry.plural);
			}
			const count = match.split(token).length - 1;
			const word = count > 1 ? entry.plural : entry.singular;
			return `${count} ${capitalize(word)}`;
		},
	);

	// Surface any leftover @-tokens that aren't in the map, so new wiki
	// tokens get noticed instead of silently passing through.
	const unknown = result.match(/@[A-Z]\w*/g);
	if (unknown) {
		for (const token of unknown) {
			console.warn(`  ! unknown icon token '${token}' left as-is`);
		}
	}

	// 4. Strip configured omit tokens (literal substrings), then collapse any
	//    whitespace they left behind.
	result = stripOmitTokens(result).replace(/\s+/g, " ").trim();

	return result;
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

export {
	cleanWikiTags,
	cleanWikiText,
	cleanWikiTextPreservingTokens,
	splitOnLineBreaks,
};
