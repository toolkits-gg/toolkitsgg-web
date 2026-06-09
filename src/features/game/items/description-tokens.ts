// Parses inline upgrade tokens embedded in item descriptions.
//
// Some games (e.g. Slay the Spire 2 cards) describe values that differ between
// the base and upgraded version of an item using a `[base|upgraded]` token,
// matching the wiki source 1:1.
//
// Examples:
//   "Deal [6|9] damage."                 -> base "6", upgraded "9"
//   "...Discard Pile[| +3]."             -> base "", upgraded " +3"
//   "Gain 5 Block.[\nExhaust.|]"         -> a token may add/remove a line
//
// Either side of a token may be empty, and either side may contain a line break
// via <br />.

type DescriptionSegment =
	| { kind: "text"; text: string }
	| { kind: "upgrade"; base: string; upgraded: string };

// Group 1 = base side, group 2 = upgraded side. Neither side may contain `]`,
// and the base side stops at the `|` separator.
const UPGRADE_TOKEN_REGEX = /\[([^\]|]*)\|([^\]]*)]/g;

const parseDescriptionSegments = (line: string): DescriptionSegment[] => {
	const segments: DescriptionSegment[] = [];
	let lastIndex = 0;

	// Use a fresh regex each call to avoid shared lastIndex state.
	const regex = new RegExp(UPGRADE_TOKEN_REGEX.source, "g");
	let match = regex.exec(line);
	while (match !== null) {
		if (match.index > lastIndex) {
			segments.push({ kind: "text", text: line.slice(lastIndex, match.index) });
		}
		segments.push({ kind: "upgrade", base: match[1], upgraded: match[2] });
		lastIndex = match.index + match[0].length;
		match = regex.exec(line);
	}

	if (lastIndex < line.length) {
		segments.push({ kind: "text", text: line.slice(lastIndex) });
	}

	return segments;
};

const renderDescriptionVariant = (
	line: string,
	variant: "base" | "upgraded",
): string =>
	line.replace(UPGRADE_TOKEN_REGEX, (_match, base: string, upgraded: string) =>
		variant === "base" ? base : upgraded,
	);

const hasUpgradeTokens = (line: string): boolean =>
	new RegExp(UPGRADE_TOKEN_REGEX.source).test(line);

export type { DescriptionSegment };
export { hasUpgradeTokens, parseDescriptionSegments, renderDescriptionVariant };
