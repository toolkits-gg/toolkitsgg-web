import { Text, type TextProps } from "@mantine/core";
import { Fragment, type ReactNode } from "react";
import {
	type DescriptionSegment,
	parseDescriptionSegments,
} from "#/features/game/items/description-tokens";

type ItemDescriptionProps = {
	description: string[];
	/** Render only the first description line (e.g. compact card preview). */
	firstOnly?: boolean;
	/** Which side of `[base|upgraded]` tokens to show. Defaults to "base". */
	variant?: "base" | "upgraded";
} & TextProps;

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

const ItemDescription = ({
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
export { ItemDescription };
