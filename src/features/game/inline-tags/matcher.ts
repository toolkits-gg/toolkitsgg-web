import type { AppItemTag } from "#/features/game/types";

type InlineTagMatcher = {
	regex: RegExp;
	byToken: Map<string, AppItemTag>;
};

type InlineTagSegment =
	| { kind: "text"; value: string }
	| { kind: "tag"; value: string; tag: AppItemTag };

const escapeRegExp = (value: string) =>
	value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Builds a single case-sensitive, whole-word regex covering every tag token.
 *
 * Tokens are sorted longest-first because regex alternation takes the first
 * branch that matches at a position: without it `BLEED` would win over
 * `BLEEDING`, and `Status Effect` over `Status Effects`. Tokens also repeat
 * across the source lists (remnant2 declares `MARKED` twice), so the first
 * declaration wins and the rest are dropped.
 */
const buildTagMatcher = (tags: AppItemTag[]): InlineTagMatcher | undefined => {
	const byToken = new Map<string, AppItemTag>();
	for (const tag of tags) {
		if (tag.token && !byToken.has(tag.token)) byToken.set(tag.token, tag);
	}
	if (byToken.size === 0) return undefined;

	const alternation = [...byToken.keys()]
		.sort((a, b) => b.length - a.length)
		.map(escapeRegExp)
		.join("|");

	return { regex: new RegExp(`\\b(?:${alternation})\\b`, "g"), byToken };
};

const splitOnTags = (
	text: string,
	matcher: InlineTagMatcher,
): InlineTagSegment[] => {
	const { regex, byToken } = matcher;
	const segments: InlineTagSegment[] = [];
	let lastIndex = 0;

	regex.lastIndex = 0;
	let match = regex.exec(text);
	while (match !== null) {
		const tag = byToken.get(match[0]);
		if (tag) {
			if (match.index > lastIndex) {
				segments.push({
					kind: "text",
					value: text.slice(lastIndex, match.index),
				});
			}
			segments.push({ kind: "tag", value: match[0], tag });
			lastIndex = match.index + match[0].length;
		}
		match = regex.exec(text);
	}

	if (lastIndex < text.length) {
		segments.push({ kind: "text", value: text.slice(lastIndex) });
	}

	return segments;
};

const matcherByGameId = new Map<string, InlineTagMatcher | undefined>();

/** Compiles each game's regex once rather than on every render. */
const getTagMatcher = (
	gameId: string,
	tags: AppItemTag[] | undefined,
): InlineTagMatcher | undefined => {
	if (!tags || tags.length === 0) return undefined;
	if (!matcherByGameId.has(gameId)) {
		matcherByGameId.set(gameId, buildTagMatcher(tags));
	}
	return matcherByGameId.get(gameId);
};

export { getTagMatcher, type InlineTagMatcher, splitOnTags };
