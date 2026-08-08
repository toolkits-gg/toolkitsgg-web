import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Divider,
	Flex,
	Group,
	ScrollArea,
	Stack,
	Text,
	Tooltip,
} from "@mantine/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { LuArrowLeft, LuCamera, LuCheck, LuPlus } from "react-icons/lu";
import { AppGameImage } from "#/components/AppGameImage";
import { AppItemDescription } from "#/components/AppItemDescription";
import { PrimaryLinkedItem } from "#/components/pages/item-list/app-item-info-modal/PrimaryLinkedItem";
import type { CollectItemInput } from "#/features/game/data/types";
import type { AppItem } from "#/features/game/types";
import { useGameId } from "#/features/game/use-game-id";
import { ScreenshotContainer } from "#/features/screenshot/ScreenshotContainer";
import type { WatermarkConfig } from "#/features/screenshot/types";
import { useScreenshot } from "#/features/screenshot/use-screenshot";
import { getGameMetadata } from "#/games-registry/public-registry";

type AppItemInfoModalProps = {
	item: AppItem;
	resolveLinkedItems: (item: AppItem) => AppItem[];
	resolvePrimaryLinkedItem?: (item: AppItem) => AppItem | null;
	isCollected: boolean;
	isCollectable: boolean;
	onCollect: ({ itemId, itemName }: CollectItemInput) => void;
	onUncollect: ({ itemId, itemName }: CollectItemInput) => void;
	onSelectLinkedItem?: (item: AppItem) => void;
	onBack?: () => void;
	canGoBack?: boolean;
	readOnly?: boolean;
};

export const AppItemInfoModal = ({
	item,
	resolveLinkedItems,
	resolvePrimaryLinkedItem,
	isCollected,
	isCollectable,
	onCollect,
	onUncollect,
	onSelectLinkedItem,
	onBack,
	canGoBack = false,
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

	const linkedItems = useMemo(
		() => resolveLinkedItems(item),
		[item, resolveLinkedItems],
	);
	const primaryLinkedItem = useMemo(
		() => resolvePrimaryLinkedItem?.(item) ?? null,
		[item, resolvePrimaryLinkedItem],
	);

	const collectControl =
		screenshotMode || !isCollectable ? null : readOnly ? (
			isCollected ? (
				<Badge size="lg" color="green" leftSection={<LuCheck size={12} />}>
					Collected
				</Badge>
			) : null
		) : (
			<Button
				size="compact-sm"
				variant={isCollected ? "filled" : "light"}
				color={isCollected ? "green" : "primary"}
				leftSection={isCollected ? <LuCheck size={14} /> : <LuPlus size={14} />}
				onClick={handleToggleCollect}
			>
				{isCollected ? "Collected" : "Mark as Collected"}
			</Button>
		);

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
					{primaryLinkedItem && (
						<Box mt={4}>
							<PrimaryLinkedItem
								item={primaryLinkedItem}
								screenshotMode={screenshotMode}
								onSelect={onSelectLinkedItem}
							/>
						</Box>
					)}
				</Stack>
			</Flex>

			{collectControl && <Group justify="flex-start">{collectControl}</Group>}

			{hasDescription && (
				<>
					<Divider label="Description" />
					<AppItemDescription description={item.description} size="xs" mt={0} />
				</>
			)}

			{linkedItems.length > 0 && screenshotMode && (
				<>
					<Divider label="Linked Items" />
					<Group wrap="wrap" gap="sm" justify="center">
						{linkedItems.map((linkedItem) => (
							<Stack
								key={`${linkedItem.id}-${linkedItem.name}`}
								align="center"
								gap={6}
								p="xs"
								w={104}
								style={{
									borderRadius: "var(--mantine-radius-md)",
									border: "1px solid var(--mantine-color-default-border)",
								}}
							>
								{linkedItem.imageUrl && (
									<Box style={{ flexShrink: 0, width: 64, height: 64 }}>
										<AppGameImage
											alt={`Image of ${linkedItem.name}`}
											src={linkedItem.imageUrl}
											size="sm"
											fit="contain"
										/>
									</Box>
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
					</Group>
				</>
			)}
		</Stack>
	);

	return (
		<Stack gap="xs">
			<Group justify="space-between" px="md">
				{canGoBack && onBack ? (
					<Tooltip label="Back" position="right">
						<ActionIcon variant="subtle" aria-label="Back" onClick={onBack}>
							<LuArrowLeft size={16} />
						</ActionIcon>
					</Tooltip>
				) : (
					<Box />
				)}

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
