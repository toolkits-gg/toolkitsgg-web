import { ActionIcon, Box, Flex, Text } from "@mantine/core";
import clsx from "clsx";
import { LuCheck, LuInfo, LuPlus, LuX } from "react-icons/lu";
import { AppGameImage } from "#/components/AppGameImage.tsx";
import { AppItemDescription } from "#/components/AppItemDescription.tsx";
import type { CollectItemInput } from "#/features/game/data/types.ts";
import type { AppItem } from "#/features/game/types.ts";
import classes from "./ItemCard.module.css";

type ItemCardProps = {
	item: AppItem;
	collectedIds: string[];
	isCollectable: boolean;
	dimUncollected: boolean;
	onCollect: ({ itemId, itemName }: CollectItemInput) => void;
	onUncollect: ({ itemId, itemName }: CollectItemInput) => void;
	onInfo: (item: AppItem) => void;
	readOnly?: boolean;
};

const ItemCard = ({
	item,
	collectedIds,
	isCollectable,
	dimUncollected,
	onCollect,
	onUncollect,
	onInfo,
	readOnly = false,
}: ItemCardProps) => {
	const isCollected = collectedIds.includes(item.id);
	const isDimmed = !isCollected && dimUncollected && isCollectable;

	const handleToggleCollect = () => {
		if (isCollected) {
			onUncollect({ itemId: item.id, itemName: item.name });
		} else {
			onCollect({ itemId: item.id, itemName: item.name });
		}
	};

	return (
		<Box
			className={clsx(classes.card, {
				[classes.collected]: isCollected && isCollectable,
				[classes.dimmed]: isDimmed,
			})}
		>
			<Box className={classes.actionBar}>
				<ActionIcon
					size={28}
					radius="sm"
					variant="transparent"
					color="white"
					aria-label="Item info"
					title="View details"
					onClick={() => onInfo(item)}
				>
					<LuInfo size={16} />
				</ActionIcon>
				{readOnly ? null : isCollectable ? (
					<ActionIcon
						size={28}
						radius="sm"
						variant="transparent"
						color="white"
						aria-label={isCollected ? "Uncollect item" : "Collect item"}
						title={isCollected ? "Remove from collected" : "Mark as collected"}
						onClick={handleToggleCollect}
					>
						{isCollected ? <LuCheck size={16} /> : <LuPlus size={16} />}
					</ActionIcon>
				) : (
					<ActionIcon
						size={28}
						radius="sm"
						variant="transparent"
						color="white"
						disabled
						title="Not collectable"
						className={classes.disabled}
					>
						<LuX size={16} />
					</ActionIcon>
				)}
			</Box>

			<Flex gap="xs" align="center" h="100%">
				{item.imageUrl ? (
					<Box style={{ flexShrink: 0, width: 48, height: 48 }}>
						<AppGameImage
							src={item.imageUrl}
							size="sm"
							alt={`Image of ${item.name}`}
						/>
					</Box>
				) : null}

				<Flex direction="column" style={{ flex: 1, minWidth: 0 }} gap={2}>
					<Text size="sm" fw={600} lh={1.2} c="primary" lineClamp={1}>
						{item.name}
					</Text>
					<Text size="xs" fw={600} tt="uppercase" c="dimmed" lh={1}>
						{String(item.category)}
						{item.subcategory && (
							<Text component="span" size="xs" fw={400} mx={4} tt="uppercase">
								· {String(item.subcategory)}
							</Text>
						)}
					</Text>
					<AppItemDescription
						description={item.description}
						firstOnly
						size="xs"
						c="dimmed"
						lh={1.15}
						mt={0}
						className={classes.description}
					/>
				</Flex>
			</Flex>
		</Box>
	);
};

export type { ItemCardProps };
export { ItemCard };
