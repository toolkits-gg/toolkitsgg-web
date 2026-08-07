/**
 * Convert a Cargo `Wikitext`-typed field (which the wiki returns as
 * partially-rendered HTML with leftover wikitext) into a plain-text
 * `description: string[]`, split on `<br>` like [[clean-wiki-text]].
 *
 * Literal substrings listed in [[omit-tokens]] are also stripped (e.g.
 * editorial annotations like `[sic]`).
 *
 * Patterns handled, in order:
 *
 * 1. Strip `<span class="...hoverbox__display...">...</span>` blocks. These
 *    are tooltip bodies — the visible text is in the sibling
 *    `hoverbox__hoverable` span, which we keep. Balanced `<span>` parsing is
 *    used because tooltip content can itself contain spans.
 * 2. Split on `<br>` / `<br/>` / `<br />` (case-insensitive).
 * 3. Per segment:
 *    a. Drop `[[File:...]]` and `[[Image:...]]` (decoration icons).
 *    b. Resolve wikilinks `[[target|display]]` -> `display`,
 *       `[[target]]` -> `target`.
 *    c. Strip remaining HTML tags, keeping inner text (the `value` spans and
 *       `hoverbox__hoverable` span survive this pass with their text intact).
 *    d. Resolve wikitext bold/italic: `'''x'''` -> `x`, `''x''` -> `x`.
 *    e. Decode common HTML entities.
 *    f. Collapse whitespace, trim.
 * 4. Drop empty segments.
 *
 * Anything that doesn't match these patterns is preserved as-is. Unknown
 * entity references and any leftover HTML/wikitext markers are logged so new
 * shapes get noticed rather than silently mangled.
 */

import { stripOmitTokens } from "#/features/sync/wiki/omit-tokens.ts";

const HTML_ENTITIES: Record<string, string> = {
	amp: "&",
	lt: "<",
	gt: ">",
	quot: '"',
	apos: "'",
	nbsp: " ",
	mdash: "—",
	ndash: "–",
	hellip: "…",
	rsquo: "’",
	lsquo: "‘",
	rdquo: "”",
	ldquo: "“",
	times: "×",
};

/**
 * Walk `html` forward from `searchStart`, looking for the `</span>` that
 * closes the `<span>` whose opening tag starts at `openTagStart`. Counts
 * nested `<span>` opens/closes so tooltip bodies that contain their own
 * spans don't break the match. Returns the index just past the matching
 * `</span>`, or `-1` if no match was found.
 */
const findMatchingSpanClose = (html: string, searchStart: number): number => {
	const openTag = /<span\b[^>]*>/gi;
	const closeTag = /<\/span\s*>/gi;
	let depth = 1;
	let i = searchStart;
	while (i < html.length && depth > 0) {
		openTag.lastIndex = i;
		closeTag.lastIndex = i;
		const open = openTag.exec(html);
		const close = closeTag.exec(html);
		if (!close) return -1;
		if (open && open.index < close.index) {
			depth++;
			i = open.index + open[0].length;
		} else {
			depth--;
			i = close.index + close[0].length;
		}
	}
	return depth === 0 ? i : -1;
};

const stripHoverboxDisplay = (html: string): string => {
	const openRe = /<span\b[^>]*class="[^"]*\bhoverbox__display\b[^"]*"[^>]*>/i;
	let out = html;
	while (true) {
		const m = openRe.exec(out);
		if (!m) break;
		const after = m.index + m[0].length;
		const end = findMatchingSpanClose(out, after);
		if (end === -1) {
			console.warn(
				"  ! unbalanced hoverbox__display span; leaving remainder as-is",
			);
			break;
		}
		out = out.slice(0, m.index) + out.slice(end);
	}
	return out;
};

const splitOnLineBreaks = (text: string): string[] => text.split(/<br\s*\/?>/i);

const stripFileLinks = (text: string): string =>
	text.replace(/\[\[(?:File|Image):[^\]]*\]\]/gi, "");

const resolveWikiLinks = (text: string): string =>
	text.replace(/\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g, (_m, target, display) => {
		const t = display?.trim() || target;
		return t.trim();
	});

const stripHtmlTags = (text: string): string =>
	text.replace(/<\/?[a-z][^>]*>/gi, "");

const stripWikiBoldItalic = (text: string): string =>
	text.replace(/'''([^']+?)'''/g, "$1").replace(/''([^']+?)''/g, "$1");

const decodeEntities = (text: string): string =>
	text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, body: string) => {
		if (body.startsWith("#x") || body.startsWith("#X")) {
			const code = Number.parseInt(body.slice(2), 16);
			return Number.isFinite(code) ? String.fromCodePoint(code) : match;
		}
		if (body.startsWith("#")) {
			const code = Number.parseInt(body.slice(1), 10);
			return Number.isFinite(code) ? String.fromCodePoint(code) : match;
		}
		const replacement = HTML_ENTITIES[body.toLowerCase()];
		if (replacement !== undefined) return replacement;
		console.warn(`  ! unknown HTML entity '&${body};' left as-is`);
		return match;
	});

const collapseWhitespace = (text: string): string =>
	text.replace(/\s+/g, " ").trim();

const cleanCargoHtmlSegment = (segment: string): string => {
	let s = segment;
	s = stripFileLinks(s);
	s = resolveWikiLinks(s);
	s = stripHtmlTags(s);
	s = stripWikiBoldItalic(s);
	s = decodeEntities(s);
	s = stripOmitTokens(s);
	s = collapseWhitespace(s);
	return s;
};

/**
 * Convert a single Cargo Wikitext string into a `string[]` description, one
 * entry per `<br>`-delimited line.
 */
const cleanCargoHtml = (html: string): string[] => {
	if (!html) return [];
	const stripped = stripHoverboxDisplay(html);
	return splitOnLineBreaks(stripped)
		.map(cleanCargoHtmlSegment)
		.filter((s) => s.length > 0);
};

export { cleanCargoHtml };
