import {
	ActionIcon,
	Button,
	EmptyState,
	Group,
	Paper,
	Stack,
	Text,
} from "@mantine/core";
import { LuTrash2 } from "react-icons/lu";
import { AppGameImage } from "#/components/AppGameImage";
import type { BuildToolRenderArgs } from "#/features/game/types";
import { ITEMS } from "#/games/remnant2/core/game-config/items";

/**
 * Placeholder for the real Remnant 2 build tool.
 *
 * The app-level editor owns everything except what goes in this component: it
 * passes the current loadout in and takes the edited loadout back out, then
 * handles saving, local queueing, sharing and screenshots itself. Replacing
 * this component with the real slot-based tool requires no changes outside this
 * file, as long as it keeps honouring `value`/`onChange`/`readOnly`.
 */
const Remnant2BuildTool = ({
	value,
	onChange,
	readOnly,
}: BuildToolRenderArgs) => {
	const itemsById = new Map(ITEMS.all.map((item) => [item.id, item]));
	const nextItem = ITEMS.collectable.find(
		(item) => !value.some((entry) => entry.itemId === item.id),
	);

	return (
		<Stack gap="sm">
			{value.length === 0 ? (
				<EmptyState
					title="No items yet"
					description={
						readOnly
							? "This build has no items."
							: "Add items to start shaping this build."
					}
				/>
			) : (
				<Stack gap="xs">
					{value.map((entry) => {
						const item = itemsById.get(entry.itemId);
						return (
							<Paper key={entry.itemId} withBorder p="xs" radius="md">
								<Group justify="space-between" wrap="nowrap">
									<Group gap="sm" wrap="nowrap">
										{item?.imageUrl && (
											<AppGameImage
												src={item.imageUrl}
												alt={`Image of ${item.name}`}
												size="sm"
												w={40}
												h={40}
												fit="contain"
											/>
										)}
										<Stack gap={0}>
											<Text fw={600}>{item?.name ?? entry.itemId}</Text>
											{item?.category && (
												<Text fz="xs" c="dimmed">
													{item.category}
												</Text>
											)}
										</Stack>
									</Group>
									{!readOnly && (
										<ActionIcon
											variant="subtle"
											color="red"
											aria-label={`Remove ${item?.name ?? entry.itemId}`}
											onClick={() =>
												onChange(value.filter((e) => e.itemId !== entry.itemId))
											}
										>
											<LuTrash2 size={16} />
										</ActionIcon>
									)}
								</Group>
							</Paper>
						);
					})}
				</Stack>
			)}

			{!readOnly && nextItem && (
				<Group>
					<Button
						variant="light"
						onClick={() =>
							onChange([...value, { itemId: nextItem.id, level: 1 }])
						}
					>
						Add item (placeholder)
					</Button>
				</Group>
			)}
		</Stack>
	);
};

export { Remnant2BuildTool };
