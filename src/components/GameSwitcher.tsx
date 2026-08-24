import {
	ActionIcon,
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
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { LuChevronRight, LuHouse, LuSearch, LuStar } from "react-icons/lu";
import { DefaultLogo } from "#/components/AppLogo";
import {
	useFavoriteGame,
	useFavoriteGames,
	useUnfavoriteGame,
} from "#/features/game/data/favorite-games/use-favorite-games";
import { useGameId } from "#/features/game/use-game-id";
import { useSetActiveGame } from "#/features/game/use-set-active-game";
import {
	gameHasContent,
	getGameLogoComponent,
	getGameMetadata,
	REGISTERED_GAME_IDS,
} from "#/games-registry/public-registry";
import type { GameId } from "@/prisma";
import classes from "./GameSwitcher.module.css";

type GameEntry = {
	id: GameId;
	label: string;
};

const allGames: GameEntry[] = REGISTERED_GAME_IDS.filter(gameHasContent).map(
	(id) => ({
		id: id as GameId,
		label: getGameMetadata(id)?.label ?? id,
	}),
);

const sortByLabel = (a: GameEntry, b: GameEntry) =>
	a.label.localeCompare(b.label);

// Profile and admin documents render per-game content without a game segment in the
// path, so switching games there swaps the content rather than the page.
const keepsPathOnGameChange = (pathname: string) =>
	pathname === "/profile" ||
	pathname.startsWith("/profile/") ||
	pathname.startsWith("/account/profile/") ||
	pathname === "/admin" ||
	pathname.startsWith("/admin/");

type GameRowProps = {
	entry: GameEntry;
	isFavorited: boolean;
	isHighlighted: boolean;
	onSelect: (id: GameId) => void;
	onToggleFavorite: (id: GameId, isFavorited: boolean) => void;
	onHighlight: () => void;
	rowRef: (node: HTMLDivElement | null) => void;
};

function GameRow({
	entry,
	isFavorited,
	isHighlighted,
	onSelect,
	onToggleFavorite,
	onHighlight,
	rowRef,
}: GameRowProps) {
	return (
		<UnstyledButton
			ref={rowRef}
			component="div"
			className={classes.gameRow}
			data-highlighted={isHighlighted || undefined}
			onMouseMove={onHighlight}
			onClick={() => onSelect(entry.id)}
		>
			<Group w="100%" justify="space-between" wrap="nowrap">
				<Text size="sm" fw={500}>
					{entry.label}
				</Text>
				<ActionIcon
					variant="subtle"
					size="sm"
					color={isFavorited ? "yellow" : "gray"}
					onClick={(e) => {
						e.stopPropagation();
						onToggleFavorite(entry.id, isFavorited);
					}}
					aria-label={
						isFavorited ? "Remove from favorites" : "Add to favorites"
					}
				>
					<LuStar
						size={14}
						style={isFavorited ? { fill: "currentColor" } : undefined}
					/>
				</ActionIcon>
			</Group>
		</UnstyledButton>
	);
}

function GameSwitcher() {
	const [opened, { toggle, close }] = useDisclosure(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [highlightedIndex, setHighlightedIndex] = useState(-1);
	const rowRefs = useRef(new Map<number, HTMLDivElement>());
	const navigate = useNavigate();
	const { location } = useRouterState();
	const activeGameId = useGameId();
	const setActiveGame = useSetActiveGame();

	const { data } = useFavoriteGames();
	const favorite = useFavoriteGame();
	const unfavorite = useUnfavoriteGame();

	const favoriteGameIds = data?.map((r) => r.gameId) ?? [];

	const activeLabel = getGameMetadata(activeGameId)?.label ?? "Toolkits.gg";
	const ActiveGameLogo = getGameLogoComponent(activeGameId);

	const filteredGames = allGames.filter((g) =>
		g.label.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const favoriteGames = filteredGames
		.filter((g) => favoriteGameIds.includes(g.id))
		.sort(sortByLabel);

	const otherGames = filteredGames
		.filter((g) => !favoriteGameIds.includes(g.id))
		.sort(sortByLabel);

	const orderedGames = [...favoriteGames, ...otherGames];
	const activeIndex =
		highlightedIndex >= 0 && highlightedIndex < orderedGames.length
			? highlightedIndex
			: -1;

	useEffect(() => {
		rowRefs.current.get(activeIndex)?.scrollIntoView({ block: "nearest" });
	}, [activeIndex]);

	const handleClose = () => {
		close();
		setSearchQuery("");
		setHighlightedIndex(-1);
	};

	const handleGoGameHome = async () => {
		await navigate({ to: `/${activeGameId}` as never });
		handleClose();
	};

	const handleSelectGame = (id: GameId) => {
		setActiveGame(id);

		// If on a game-scoped route, navigate to the same sub-path under the new game
		const segments = location.pathname.split("/").filter(Boolean);
		if (
			segments.length > 0 &&
			(REGISTERED_GAME_IDS as readonly string[]).includes(segments[0])
		) {
			segments[0] = id;
			void navigate({ to: `/${segments.join("/")}` as never });
		} else if (!keepsPathOnGameChange(location.pathname)) {
			void navigate({ to: `/${id}` as never });
		}
		handleClose();
	};

	const handleSearchChange = (value: string) => {
		setSearchQuery(value);
		setHighlightedIndex(value.trim().length > 0 ? 0 : -1);
	};

	const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "ArrowDown" || e.key === "ArrowUp") {
			e.preventDefault();
			if (orderedGames.length === 0) return;
			const delta = e.key === "ArrowDown" ? 1 : -1;
			const from = activeIndex < 0 ? (delta > 0 ? -1 : 0) : activeIndex;
			setHighlightedIndex(
				(from + delta + orderedGames.length) % orderedGames.length,
			);
			return;
		}

		if (e.key === "Enter") {
			const target =
				activeIndex >= 0
					? orderedGames[activeIndex]
					: orderedGames.length === 1
						? orderedGames[0]
						: undefined;
			if (!target) return;
			e.preventDefault();
			handleSelectGame(target.id);
		}
	};

	const registerRow = (index: number) => (node: HTMLDivElement | null) => {
		if (node) {
			rowRefs.current.set(index, node);
		} else {
			rowRefs.current.delete(index);
		}
	};

	const handleToggleFavorite = (id: GameId, isFavorited: boolean) => {
		if (isFavorited) {
			unfavorite.mutate({ gameId: id });
		} else {
			favorite.mutate({ gameId: id });
		}
	};

	return (
		<Popover
			width={320}
			position="bottom-start"
			withArrow
			shadow="md"
			withinPortal
			opened={opened}
			onChange={(isOpen) => {
				if (!isOpen) handleClose();
			}}
			zIndex="var(--mantine-z-index-popover)"
			trapFocus
		>
			<Popover.Target>
				<UnstyledButton
					component="div"
					className={classes.trigger}
					onClick={toggle}
					data-wizard-target="game-switcher"
				>
					<Group wrap="nowrap" gap="xs" justify="space-between">
						<Flex align="center" gap="sm">
							{ActiveGameLogo ? <ActiveGameLogo /> : <DefaultLogo />}
							<Text size="sm" fw={600}>
								{activeLabel}
							</Text>
						</Flex>
						<LuChevronRight size={18} />
					</Group>
				</UnstyledButton>
			</Popover.Target>

			<Popover.Dropdown className={classes.dropdown}>
				<TextInput
					placeholder="Search games..."
					leftSection={<LuSearch size={16} />}
					value={searchQuery}
					onChange={(e) => handleSearchChange(e.currentTarget.value)}
					onKeyDown={handleSearchKeyDown}
					className={classes.searchInput}
					size="sm"
					data-autofocus
				/>

				{activeGameId !== "none" && (
					<UnstyledButton
						component="div"
						className={classes.gameRow}
						onClick={handleGoGameHome}
					>
						<Group gap="xs">
							<LuHouse size={14} />
							<Text size="sm" fw={500}>
								{activeLabel} Home
							</Text>
						</Group>
					</UnstyledButton>
				)}

				<Divider my="xs" className={classes.separator} />

				<ScrollArea.Autosize mah={400} type="auto">
					{favoriteGames.length > 0 && (
						<>
							<Text
								size="xs"
								c="dimmed"
								tt="uppercase"
								fw={700}
								px="xs"
								pt="xs"
								pb={4}
							>
								Favorites
							</Text>
							<Stack gap={4}>
								{favoriteGames.map((entry, index) => (
									<GameRow
										key={entry.id}
										entry={entry}
										isFavorited
										isHighlighted={activeIndex === index}
										onSelect={handleSelectGame}
										onToggleFavorite={handleToggleFavorite}
										onHighlight={() => setHighlightedIndex(index)}
										rowRef={registerRow(index)}
									/>
								))}
							</Stack>
							{otherGames.length > 0 && (
								<Divider my="xs" className={classes.separator} />
							)}
						</>
					)}

					{otherGames.length > 0 && (
						<>
							<Text
								size="xs"
								c="dimmed"
								tt="uppercase"
								fw={700}
								px="xs"
								pt="xs"
								pb={4}
							>
								All Games
							</Text>
							<Stack gap={2}>
								{otherGames.map((entry, index) => {
									const orderedIndex = favoriteGames.length + index;
									return (
										<GameRow
											key={entry.id}
											entry={entry}
											isFavorited={false}
											isHighlighted={activeIndex === orderedIndex}
											onSelect={handleSelectGame}
											onToggleFavorite={handleToggleFavorite}
											onHighlight={() => setHighlightedIndex(orderedIndex)}
											rowRef={registerRow(orderedIndex)}
										/>
									);
								})}
							</Stack>
						</>
					)}

					{favoriteGames.length === 0 && otherGames.length === 0 && (
						<Text c="dimmed" ta="center" py="md" size="sm">
							No games found
						</Text>
					)}
				</ScrollArea.Autosize>
			</Popover.Dropdown>
		</Popover>
	);
}

export { GameSwitcher };
