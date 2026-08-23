import { Box, Text, Tooltip, UnstyledButton } from "@mantine/core";
import clsx from "clsx";
import { GameImage } from "#/components/GameImage.tsx";
import type { AppItem } from "#/features/game/types";
import classes from "./PrimaryLinkedItem.module.css";

type PrimaryLinkedItemProps = {
	item: AppItem;
	screenshotMode: boolean;
	onSelect?: (item: AppItem) => void;
};

const PrimaryLinkedItem = ({
	item,
	screenshotMode,
	onSelect,
}: PrimaryLinkedItemProps) => {
	const isInteractive = !screenshotMode && onSelect !== undefined;

	const content = (
		<>
			{item.imageUrl ? (
				<Box style={{ flexShrink: 0, width: 24, height: 24 }}>
					<GameImage
						alt={`Image of ${item.name}`}
						src={item.imageUrl}
						size="sm"
						fit="contain"
					/>
				</Box>
			) : null}
			<Text size="xs" fw={600} lh={1.2} c="primary" lineClamp={1}>
				{item.name}
			</Text>
			<Text size="xs" fw={600} tt="uppercase" c="dimmed" lh={1.2}>
				{String(item.category)}
			</Text>
		</>
	);

	if (!isInteractive) {
		return <Box className={classes.chip}>{content}</Box>;
	}

	return (
		<Tooltip label={`View ${item.name}`} position="right">
			<UnstyledButton
				className={clsx(classes.chip, classes.interactive)}
				onClick={() => onSelect(item)}
			>
				{content}
			</UnstyledButton>
		</Tooltip>
	);
};

export type { PrimaryLinkedItemProps };
export { PrimaryLinkedItem };
