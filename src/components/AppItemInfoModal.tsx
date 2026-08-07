import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Divider,
	Flex,
	Group,
	ScrollArea,
	SimpleGrid,
	Stack,
	Text,
	Tooltip,
} from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { LuCamera, LuCheck, LuPlus } from "react-icons/lu";
import { AppGameImage } from "#/components/AppGameImage.tsx";
import { AppItemDescription } from "#/components/AppItemDescription.tsx";
import type { CollectItemInput } from "#/features/game/data/types.ts";
import type { AppItem } from "#/features/game/types.ts";
import { useGameId } from "#/features/game/use-game-id.ts";
import { ScreenshotContainer } from "#/features/screenshot/ScreenshotContainer.tsx";
import type { WatermarkConfig } from "#/features/screenshot/types.ts";
import { useScreenshot } from "#/features/screenshot/use-screenshot.ts";
import { getGameMetadata } from "#/game-registry/public-registry.ts";

export type AppItemInfoModalProps = {
	item: AppItem;
	resolveLinkedItems: (item: AppItem) => AppItem[];
	isCollected: boolean;
	isCollectable: boolean;
	onCollect: ({ itemId, itemName }: CollectItemInput) => void;
	onUncollect: ({ itemId, itemName }: CollectItemInput) => void;
	readOnly?: boolean;
};

export const AppItemInfoModal = ({
	item,
	resolveLinkedItems,
	isCollected,
	isCollectable,
	onCollect,
	onUncollect,
	readOnly = false,
}: AppItemInfoModalProps) => {
	const [screenshotMode, setScreenshotMode] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const gameId = useGameId();
	const metadata = getGameMetadata(gameId);
	const watermark: WatermarkConfig | false = metadata
		? {
				gameConfig: {
					METADATA: {
						LogoComponent: metadata.LogoComponent,
						label: metadata.label,
					},
				},
			}
		: false;

	const { triggerScreenshot, screenshotLoading } = useScreenshot({
		ref: containerRef,
		filename: `${item.name}.png`,
	});

	const captureStartedRef = useRef(false);
	useEffect(() => {
		if (screenshotLoading) {
			captureStartedRef.current = true;
		} else if (captureStartedRef.current) {
			captureStartedRef.current = false;
			setScreenshotMode(false);
		}
	}, [screenshotLoading]);

	const handleCapture = () => {
		setScreenshotMode(true);
		triggerScreenshot();
	};

	const hasDescription =
		item.description.length > 0 && item.description[0] !== "";

	const handleToggleCollect = () => {
		if (isCollected) {
			onUncollect({ itemId: item.id, itemName: item.name });
		} else {
			onCollect({ itemId: item.id, itemName: item.name });
		}
	};

	const linkedItems = resolveLinkedItems(item);

	const itemContent = (
		<Stack gap="md" p="md">
			<Flex gap="md" align="flex-start">
				{item.imageUrl ? (
					<Box style={{ flexShrink: 0, width: 96, height: 96 }}>
						<AppGameImage
							alt={`Image of ${item.name}`}
							src={item.imageUrl}
							size="md"
						/>
					</Box>
				) : null}

				<Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
					<Text size="xl" fw={700} lh={1.2} c="primary">
						{item.name}
					</Text>
					<Group gap="xs">
						<Text size="xs" fw="bold">
							{String(item.category)}
						</Text>

						{item.subcategory && (
							<Text size="xs" c="dimmed">
								{String(item.subcategory)}
							</Text>
						)}
					</Group>
					{!screenshotMode &&
						isCollectable &&
						(readOnly ? (
							isCollected ? (
								<Box mt="xs">
									<Badge
										size="lg"
										color="green"
										leftSection={<LuCheck size={12} />}
									>
										Collected
									</Badge>
								</Box>
							) : null
						) : (
							<Box mt="xs">
								<Button
									size="compact-sm"
									variant={isCollected ? "filled" : "light"}
									color={isCollected ? "green" : "primary"}
									leftSection={
										isCollected ? <LuCheck size={14} /> : <LuPlus size={14} />
									}
									onClick={handleToggleCollect}
								>
									{isCollected ? "Collected" : "Mark as Collected"}
								</Button>
							</Box>
						))}
				</Stack>
			</Flex>

			{hasDescription && (
				<>
					<Divider label="Description" />
					<AppItemDescription description={item.description} size="xs" mt={0} />
				</>
			)}

			{linkedItems.length > 0 && screenshotMode && (
				<>
					<Divider label="Linked Items" />
					<SimpleGrid cols={2} spacing="sm">
						{linkedItems.map((linkedItem) => (
							<Stack
								key={`${linkedItem.id}-${linkedItem.name}`}
								align="center"
								gap={6}
								p="xs"
								style={{
									borderRadius: "var(--mantine-radius-md)",
									border: "1px solid var(--mantine-color-default-border)",
								}}
							>
								{linkedItem.imageUrl && (
									<AppGameImage
										alt={`Image of ${linkedItem.name}`}
										src={linkedItem.imageUrl}
										size="md"
									/>
								)}
								<Stack gap={2} align="center">
									<Text size="xs" fw={600} ta="center" lh={1.3}>
										{linkedItem.name}
									</Text>
									<Badge variant="light" size="xs">
										{String(linkedItem.category)}
									</Badge>
								</Stack>
							</Stack>
						))}
					</SimpleGrid>
				</>
			)}
		</Stack>
	);

	return (
		<Stack gap="xs">
			<Group justify="flex-end" px="md">
				<Tooltip label="Screenshot" position="left">
					<ActionIcon
						variant="subtle"
						loading={screenshotLoading}
						onClick={handleCapture}
					>
						<LuCamera size={16} />
					</ActionIcon>
				</Tooltip>
			</Group>

			<ScreenshotContainer
				ref={containerRef}
				screenshotMode={screenshotMode}
				watermark={watermark}
				miw={screenshotMode ? 500 : undefined}
			>
				{screenshotMode ? (
					itemContent
				) : (
					<ScrollArea mah="80vh">{itemContent}</ScrollArea>
				)}
			</ScreenshotContainer>
		</Stack>
	);
};
