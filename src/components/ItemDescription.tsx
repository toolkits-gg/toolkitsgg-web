import { Text, type TextProps } from "@mantine/core";
import { Fragment, type ReactNode } from "react";
import {
	renderInlineTags,
	useInlineTagMatcher,
} from "#/features/game/inline-tags/InlineTags";
import type { InlineTagMatcher } from "#/features/game/inline-tags/matcher";

type ItemDescriptionProps = {
	description: string[];
	firstOnly?: boolean; // Render only the first description line (e.g. compact card preview).
	singleLine?: boolean; // Collapse every line into one `Text` so it can truncate as a single run.
	variant?: "base" | "upgraded"; // Which side of `[base|upgraded]` tokens to show. Defaults to "base".
	withTooltips?: boolean; // Defaults to true, but off for `singleLine` so truncated cells stay quiet.
	title?: string;
} & TextProps;

type RenderContext = {
	variant: "base" | "upgraded";
	singleLine: boolean;
	matcher: InlineTagMatcher | undefined;
	withTooltips: boolean;
};

// Parses inline upgrade tokens embedded in item descriptions.
//
// Some games (e.g. Slay the Spire 2 cards) describe values that differ between
// the base and upgraded version of an item using a `[base|upgraded]` token.
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

const UPGRADE_TOKEN_REGEX = /\[(?<base>[^\]|]*)\|(?<upgraded>[^\]]*)]/g;
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
		const { base = "", upgraded = "" } = match.groups ?? {};
		segments.push({ kind: "upgrade", base, upgraded });
		lastIndex = match.index + match[0].length;
		match = regex.exec(line);
	}

	if (lastIndex < line.length) {
		segments.push({ kind: "text", text: line.slice(lastIndex) });
	}

	return segments;
};

/**
 * Splits a string on `\n` (introduced by a `<br>` inside an upgrade token) into
 * text nodes separated by <br/> elements.
 */
const withLineBreaks = (
	text: string,
	keyPrefix: string,
	ctx: RenderContext,
): ReactNode[] => {
	const tag = (part: string, index: number) =>
		renderInlineTags(part, ctx.matcher, {
			withTooltips: ctx.withTooltips,
			keyPrefix: `${keyPrefix}-${index}`,
		});

	const parts = text.split("\n");
	if (ctx.singleLine) return [tag(parts.join(" "), 0)];

	return parts.flatMap((part, index) =>
		index === 0
			? [tag(part, index)]
			: // biome-ignore lint/suspicious/noArrayIndexKey: order never changes
				[<br key={`${keyPrefix}-br-${index}`} />, tag(part, index)],
	);
};
const renderSegment = (
	segment: DescriptionSegment,
	key: string,
	ctx: RenderContext,
): ReactNode => {
	if (segment.kind === "text") {
		return (
			<Fragment key={key}>{withLineBreaks(segment.text, key, ctx)}</Fragment>
		);
	}

	const value = ctx.variant === "base" ? segment.base : segment.upgraded;
	if (value === "") return null;

	return (
		<Text key={key} component="span" inherit c="teal" fw={600}>
			{withLineBreaks(value, key, ctx)}
		</Text>
	);
};

const renderLine = (line: string, ctx: RenderContext): ReactNode[] =>
	parseDescriptionSegments(line).map((segment, index) =>
		renderSegment(segment, `seg-${index}`, ctx),
	);

export const ItemDescription = ({
	description,
	firstOnly = false,
	singleLine = false,
	variant = "base",
	withTooltips,
	...textProps
}: ItemDescriptionProps) => {
	const matcher = useInlineTagMatcher();
	const hasDescription = description.length > 0 && description[0] !== "";
	if (!hasDescription) return null;

	const ctx: RenderContext = {
		variant,
		singleLine,
		matcher,
		withTooltips: withTooltips ?? !singleLine,
	};
	const lines = firstOnly ? description.slice(0, 1) : description;

	if (singleLine) {
		return (
			<Text {...textProps}>
				{lines.map((line, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static description lines never reorder, and lines may repeat so content alone is not unique
					<Fragment key={`line-${index}-${line}`}>
						{index > 0 ? " " : null}
						{renderLine(line, ctx)}
					</Fragment>
				))}
			</Text>
		);
	}

	return (
		<>
			{lines.map((line, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: static description lines never reorder, and lines may repeat so content alone is not unique
				<Text key={`line-${index}-${line}`} {...textProps}>
					{renderLine(line, ctx)}
				</Text>
			))}
		</>
	);
};

export const renderDescriptionVariant = (
	line: string,
	variant: "base" | "upgraded",
): string =>
	line.replace(UPGRADE_TOKEN_REGEX, (_match, base: string, upgraded: string) =>
		variant === "base" ? base : upgraded,
	);
