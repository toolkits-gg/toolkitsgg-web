import {
	Divider,
	Flex,
	Group,
	Popover,
	ScrollArea,
	Stack,
	Text,
	TextInput,
	UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { LuChevronDown, LuSearch } from "react-icons/lu";
import { useFavoriteGames } from "#/features/game/data/favorite-games/use-favorite-games";
import {
	getGameLogoComponent,
	getGameMetadata,
} from "#/games-registry/public-registry";
import type { GameId } from "@/prisma";
import classes from "./GamePickerPopover.module.css";

/** Below this many games the search field is more clutter than help. */
const SEARCH_THRESHOLD = 3;

type GamePickerPopoverProps = {
	/** Games to offer, already filtered to those with the asset being picked. */
	gameIds: GameId[];
	value: GameId;
	onChange: (next: GameId) => void;
};

type GameOption = { gameId: GameId; label: string };

/**
 * The game selector shared by every asset picker: which game's art am I
 * browsing? Favorites float to the top because the picker is most often opened
 * to grab something from a game the user already plays.
 */
const GamePickerPopover = ({
	gameIds,
	value,
	onChange,
}: GamePickerPopoverProps) => {
	const favoritesQuery = useFavoriteGames();
	const favoriteGameIds = (favoritesQuery.data ?? []).map((f) => f.gameId);

	const [search, setSearch] = useState("");
	const [opened, { toggle, close }] = useDisclosure(false);

	const options: GameOption[] = gameIds.map((gameId) => ({
		gameId,
		label: getGameMetadata(gameId)?.label ?? gameId,
	}));

	const selected = options.find((o) => o.gameId === value);
	const SelectedLogo = selected
		? getGameLogoComponent(selected.gameId)
		: undefined;

	const filtered = options.filter((o) =>
		o.label.toLowerCase().includes(search.toLowerCase()),
	);
	const favorites = filtered
		.filter((o) => favoriteGameIds.includes(o.gameId))
		.sort((a, b) => a.label.localeCompare(b.label));
	const others = filtered
		.filter((o) => !favoriteGameIds.includes(o.gameId))
		.sort((a, b) => a.label.localeCompare(b.label));

	const handleSelect = (next: GameId) => {
		onChange(next);
		close();
		setSearch("");
	};

	const renderRow = (option: GameOption, compact: boolean) => {
		const LogoComponent = getGameLogoComponent(option.gameId);
		return (
			<UnstyledButton
				key={option.gameId}
				className={`${classes.gameRow} ${compact ? classes.gameRowCompact : ""}`}
				onClick={() => handleSelect(option.gameId)}
			>
				<Flex align="center" gap={compact ? "sm" : "md"}>
					{LogoComponent && <LogoComponent size={compact ? 24 : 36} />}
					<Text size={compact ? "sm" : "md"} fw={500}>
						{option.label}
					</Text>
				</Flex>
			</UnstyledButton>
		);
	};

	const renderSection = (
		heading: string,
		sectionOptions: GameOption[],
		compact: boolean,
	) => (
		<>
			{heading && (
				<Text
					size="xs"
					c="dimmed"
					tt="uppercase"
					fw={700}
					px="xs"
					pt="xs"
					pb={4}
				>
					{heading}
				</Text>
			)}
			<Stack gap={4}>
				{sectionOptions.map((option) => renderRow(option, compact))}
			</Stack>
		</>
	);

	return (
		<Popover
			width="target"
			position="bottom-start"
			shadow="md"
			opened={opened}
			onChange={(isOpen) => {
				if (!isOpen) {
					close();
					setSearch("");
				}
			}}
			trapFocus
		>
			<Popover.Target>
				<UnstyledButton className={classes.gameSelectorButton} onClick={toggle}>
					<Group wrap="nowrap" gap="sm" justify="space-between">
						<Flex align="center" gap="sm">
							{SelectedLogo && <SelectedLogo size={36} />}
							<Text size="sm" fw={600}>
								{selected?.label ?? "Select a game"}
							</Text>
						</Flex>
						<LuChevronDown size={16} />
					</Group>
				</UnstyledButton>
			</Popover.Target>

			<Popover.Dropdown className={classes.gameSelectorDropdown}>
				{options.length > SEARCH_THRESHOLD && (
					<TextInput
						placeholder="Search games..."
						leftSection={<LuSearch size={16} />}
						value={search}
						onChange={(event) => setSearch(event.currentTarget.value)}
						className={classes.searchInput}
						size="sm"
						data-autofocus
					/>
				)}

				<ScrollArea.Autosize mah={300} type="auto">
					{favorites.length > 0 && (
						<>
							{renderSection("Favorites", favorites, false)}
							{others.length > 0 && (
								<Divider my="xs" className={classes.separator} />
							)}
						</>
					)}

					{others.length > 0 &&
						renderSection(
							favorites.length > 0 ? "All Other Games" : "",
							others,
							favorites.length > 0,
						)}

					{favorites.length === 0 && others.length === 0 && (
						<Text c="dimmed" ta="center" py="md" size="sm">
							No games found
						</Text>
					)}
				</ScrollArea.Autosize>
			</Popover.Dropdown>
		</Popover>
	);
};

export { GamePickerPopover };
