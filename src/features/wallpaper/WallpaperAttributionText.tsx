import { Anchor, Text, type TextProps } from "@mantine/core";
import type { WallpaperAttribution } from "#/features/game/types";

type WallpaperAttributionTextProps = TextProps & {
	attribution: WallpaperAttribution;
};

const WallpaperAttributionText = ({
	attribution,
	...textProps
}: WallpaperAttributionTextProps) => (
	<Text size="xs" c="dimmed" truncate {...textProps}>
		Courtesy of{" "}
		{attribution.url ? (
			<Anchor
				href={attribution.url}
				target="_blank"
				rel="noopener noreferrer"
				size="xs"
			>
				{attribution.name}
			</Anchor>
		) : (
			attribution.name
		)}
	</Text>
);

export { WallpaperAttributionText };
