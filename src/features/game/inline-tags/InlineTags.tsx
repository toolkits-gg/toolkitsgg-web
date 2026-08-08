import { Text, Tooltip } from "@mantine/core";
import type { ReactNode } from "react";
import {
	getTagMatcher,
	type InlineTagMatcher,
	splitOnTags,
} from "#/features/game/inline-tags/matcher";
import { useGameId } from "#/features/game/use-game-id";
import { getGameInlineTags } from "#/games-registry/public-registry";

type RenderInlineTagsOptions = {
	/** Off for truncating single-line contexts, where a tooltip per token is noise. */
	withTooltips?: boolean;
	keyPrefix?: string;
};

/**
 * Splits plain text into nodes, colorizing any game term it contains. Returns
 * the input untouched when the game has no tags or the text contains none, so
 * callers pay nothing for the common case.
 */
export const renderInlineTags = (
	text: string,
	matcher: InlineTagMatcher | undefined,
	{ withTooltips = true, keyPrefix = "tag" }: RenderInlineTagsOptions = {},
): ReactNode => {
	if (!matcher || !text) return text;

	const segments = splitOnTags(text, matcher);
	if (segments.length === 1 && segments[0].kind === "text") return text;

	return segments.map((segment, index) => {
		const key = `${keyPrefix}-${index}`;
		if (segment.kind === "text") return segment.value;

		const { tag, value } = segment;
		const token = (
			<Text
				key={key}
				component="span"
				inherit
				fw={600}
				style={{ color: `light-dark(${tag.color.light}, ${tag.color.dark})` }}
			>
				{value}
			</Text>
		);

		if (!withTooltips || !tag.description) return token;

		return (
			<Tooltip key={key} label={tag.description} multiline maw={280} withArrow>
				{token}
			</Tooltip>
		);
	});
};

export const useInlineTagMatcher = (): InlineTagMatcher | undefined => {
	const gameId = useGameId();
	return getTagMatcher(gameId, getGameInlineTags(gameId));
};
