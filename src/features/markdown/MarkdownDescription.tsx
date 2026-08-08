import { Box, type BoxProps } from "@mantine/core";
import { Markdown } from "@tanstack/markdown/react";
import cx from "clsx";
import { useMemo } from "react";
import { useInlineTagMatcher } from "#/features/game/inline-tags/InlineTags";
import { createMarkdownComponents } from "#/features/markdown/markdown-components";
import classes from "./MarkdownDescription.module.css";

type MarkdownDescriptionProps = {
	children: string | null | undefined;
	className?: string;
} & Omit<BoxProps, "className">;

/**
 * Renders user-authored description text as markdown, colorizing the active
 * game's terms and giving the ones that carry an explanation a hover tooltip.
 * Raw HTML is off by default in the parser, and `javascript:`-style URLs are
 * stripped by it, so nothing here needs to sanitize.
 */
const MarkdownDescription = ({
	children,
	className,
	...boxProps
}: MarkdownDescriptionProps) => {
	const matcher = useInlineTagMatcher();
	const components = useMemo(
		() => createMarkdownComponents(matcher),
		[matcher],
	);

	if (!children?.trim()) return null;

	return (
		<Box className={cx(classes.markdown, className)} {...boxProps}>
			<Markdown components={components}>{children}</Markdown>
		</Box>
	);
};

export { MarkdownDescription };
