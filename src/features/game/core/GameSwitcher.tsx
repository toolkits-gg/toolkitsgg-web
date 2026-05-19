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
import { useState } from "react";
import {
	LuChevronRight,
	LuHouse,
	LuSearch,
	LuStar,
	LuUser,
} from "react-icons/lu";

import { DefaultLogo } from "#/components/AppLogo";
import { favoriteGameActions } from "#/features/auth/dal/favorite-games/favorite-games.actions";
import { useDalMutation } from "#/features/dal/hooks/use-dal-mutation";
import { useDalQuery } from "#/features/dal/hooks/use-dal-query";
import { setGame } from "#/features/game/core/store";
import { useGameId } from "#/features/game/core/use-game-id";
import { setActiveGameCookie } from "#/features/game/core/utils";
import {
	getGameConfig,
	getGameLogoComponent,
	REGISTERED_GAME_IDS,
} from "#/features/game/registry/game-registry";
import type { GameId } from "@/prisma";

import classes from "./GameSwitcher.module.css";

type GameEntry = {
	id: GameId;
	label: string;
};

const allGames: GameEntry[] = REGISTERED_GAME_IDS.map((id) => ({
	id: id as GameId,
	label: getGameConfig(id)?.THEME?.label ?? id,
}));

const sortByLabel = (a: GameEntry, b: GameEntry) =>
	a.label.localeCompare(b.label);

type GameRowProps = {
	entry: GameEntry;
	isFavorited: boolean;
	onSelect: (id: GameId) => void;
	onToggleFavorite: (id: GameId, isFavorited: boolean) => void;
};

function GameRow({
	entry,
	isFavorited,
	onSelect,
	onToggleFavorite,
}: GameRowProps) {
	return (
		<UnstyledButton
			component="div"
			className={classes.gameRow}
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
	const activeGameId = useGameId();
	const navigate = useNavigate();
	const { location } = useRouterState();

	const { data } = useDalQuery(favoriteGameActions.list, undefined);
	const favorite = useDalMutation(favoriteGameActions.favorite);
	const unfavorite = useDalMutation(favoriteGameActions.unfavorite);

	const favoriteGameIds = data?.map((r) => r.gameId) ?? [];

	const activeLabel =
		getGameConfig(activeGameId)?.THEME?.label ?? "Toolkits.gg";
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

	const handleClose = () => {
		close();
		setSearchQuery("");
	};

	const handleGoHome = async () => {
		setActiveGameCookie(null);
		setGame(null);
		await navigate({ to: "/" });
		handleClose();
	};

	const handleGoProfileHome = async () => {
		await navigate({ to: "/profile" });
		handleClose();
	};

	const handleSelectGame = (id: GameId) => {
		setActiveGameCookie(id);
		setGame(id);

		// If on a game-scoped route, navigate to the same sub-path under the new game
		const segments = location.pathname.split("/").filter(Boolean);
		if (
			segments.length > 0 &&
			(REGISTERED_GAME_IDS as readonly string[]).includes(segments[0])
		) {
			segments[0] = id;
			void navigate({ to: `/${segments.join("/")}` as never });
		}

		handleClose();
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
					onChange={(e) => setSearchQuery(e.currentTarget.value)}
					className={classes.searchInput}
					size="sm"
					data-autofocus
				/>

				<UnstyledButton
					component="div"
					className={classes.gameRow}
					onClick={handleGoHome}
				>
					<Group gap="xs">
						<LuHouse size={14} />
						<Text size="sm" fw={500}>
							Home
						</Text>
					</Group>
				</UnstyledButton>
				<UnstyledButton
					component={"div"}
					className={classes.gameRow}
					onClick={handleGoProfileHome}
				>
					<Group gap="xs">
						<LuUser size={14} />
						<Text size="sm" fw={500}>
							User Profile
						</Text>
					</Group>
				</UnstyledButton>

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
								{favoriteGames.map((entry) => (
									<GameRow
										key={entry.id}
										entry={entry}
										isFavorited
										onSelect={handleSelectGame}
										onToggleFavorite={handleToggleFavorite}
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
								{otherGames.map((entry) => (
									<GameRow
										key={entry.id}
										entry={entry}
										isFavorited={false}
										onSelect={handleSelectGame}
										onToggleFavorite={handleToggleFavorite}
									/>
								))}
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
