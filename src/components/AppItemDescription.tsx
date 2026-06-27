import { Text, type TextProps } from "@mantine/core";
import { Fragment, type ReactNode } from "react";

type ItemDescriptionProps = {
	description: string[];
	/** Render only the first description line (e.g. compact card preview). */
	firstOnly?: boolean;
	/** Which side of `[base|upgraded]` tokens to show. Defaults to "base". */
	variant?: "base" | "upgraded";
} & TextProps;

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
}

/**
 * Splits a string on `\n` (introduced by a `<br>` inside an upgrade token) into
 * text nodes separated by <br/> elements.
 */
const withLineBreaks = (text: string, keyPrefix: string): ReactNode[] => {
	const parts = text.split("\n");
	return parts.flatMap((part, index) =>
		index === 0
			? [part]
			: // biome-ignore lint/suspicious/noArrayIndexKey: order never changes
				[<br key={`${keyPrefix}-br-${index}`} />, part],
	);
};

export const renderDescriptionVariant = (
	line: string,
	variant: "base" | "upgraded",
): string =>	line.replace(UPGRADE_TOKEN_REGEX, (_match, base: string, upgraded: string) =>
		variant === "base" ? base : upgraded,
	);

const renderSegment = (
	segment: DescriptionSegment,
	variant: "base" | "upgraded",
	key: string,
): ReactNode => {
	if (segment.kind === "text") {
		return <Fragment key={key}>{withLineBreaks(segment.text, key)}</Fragment>;
	}

	const value = variant === "base" ? segment.base : segment.upgraded;
	if (value === "") return null;

	return (
		<Text key={key} component="span" inherit c="teal" fw={600}>
			{withLineBreaks(value, key)}
		</Text>
	);
};

const renderLine = (line: string, variant: "base" | "upgraded"): ReactNode[] =>
	parseDescriptionSegments(line).map((segment, index) =>
		renderSegment(segment, variant, `seg-${index}`),
	);

const AppItemDescription = ({
	description,
	firstOnly = false,
	variant = "base",
	...textProps
}: ItemDescriptionProps) => {
	const hasDescription = description.length > 0 && description[0] !== "";
	if (!hasDescription) return null;

	const lines = firstOnly ? description.slice(0, 1) : description;

	return (
		<>
			{lines.map((line, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: static description lines never reorder, and lines may repeat so content alone is not unique
				<Text key={`line-${index}-${line}`} {...textProps}>
					{renderLine(line, variant)}
				</Text>
			))}
		</>
	);
};

export type { ItemDescriptionProps };
export { AppItemDescription };
