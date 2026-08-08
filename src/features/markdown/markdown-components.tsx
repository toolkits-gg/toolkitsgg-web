import { Anchor, Title } from "@mantine/core";
import type { MarkdownComponents } from "@tanstack/markdown/react";
import { Children, createElement, type ReactNode } from "react";
import { renderInlineTags } from "#/features/game/inline-tags/InlineTags";
import type { InlineTagMatcher } from "#/features/game/inline-tags/matcher";

/**
 * The markdown renderer emits text nodes as bare strings, so tag colorization
 * happens here: every element that can hold text gets an override that rewrites
 * its own string children. Nesting works without recursion because each nested
 * element (`**BLEEDING**` -> `strong`) is itself overridden and receives its own
 * string child. `code` and `pre` are deliberately left alone so code spans stay
 * literal.
 */
const tagged = (children: ReactNode, matcher: InlineTagMatcher | undefined) => {
	if (!matcher) return children;
	return Children.map(children, (child, index) =>
		typeof child === "string"
			? renderInlineTags(child, matcher, { keyPrefix: `s${index}` })
			: child,
	);
};

const TEXT_TAGS = ["p", "li", "strong", "em", "del", "td", "th"] as const;

// A description sits under the build's own `Title order={2}`, so the biggest
// heading it can produce is one step smaller and it shrinks from there.
const headingOrder = (depth: number) => Math.min(depth + 2, 6) as 3 | 4 | 5 | 6;

type OverrideProps = { children?: ReactNode };

export const createMarkdownComponents = (
	matcher: InlineTagMatcher | undefined,
): MarkdownComponents => {
	const components: Record<string, (props: OverrideProps) => ReactNode> = {
		// User descriptions must not embed remote images: they are a tracking and
		// moderation vector, and they break the PNG screenshot export.
		img: () => null,
		a: ({ children, ...props }) => (
			<Anchor {...props} target="_blank" rel="noreferrer nofollow ugc">
				{tagged(children, matcher)}
			</Anchor>
		),
	};

	for (const tag of TEXT_TAGS) {
		components[tag] = ({ children, ...props }) =>
			createElement(tag, props, tagged(children, matcher));
	}

	for (const depth of [1, 2, 3, 4, 5, 6]) {
		components[`h${depth}`] = ({ children, ...props }) => (
			<Title {...props} order={headingOrder(depth)}>
				{tagged(children, matcher)}
			</Title>
		);
	}

	return components;
};
