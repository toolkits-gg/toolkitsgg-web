import {
	ActionIcon,
	Avatar,
	Badge,
	Button,
	Divider,
	Flex,
	Group,
	Popover,
	ScrollArea,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
	Tooltip,
	UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { LuCheck, LuChevronDown, LuSearch, LuX } from "react-icons/lu";
import { avatarImageUrl } from "#/features/auth/core/utils";
import { favoriteGameActions } from "#/features/auth/dal/favorite-games/favorite-games.actions";
import { useUserProfile } from "#/features/auth/hooks/use-user-profile";
import { useDalQuery } from "#/features/dal/hooks/use-dal-query";
import type { GameAvatar } from "#/features/game/core/types";
import { useGameId } from "#/features/game/core/use-game-id";
import {
	getGameAvatars,
	getGameConfig,
	getGameLogoComponent,
	REGISTERED_GAME_IDS,
} from "#/features/game/registry/game-registry";
import type { GameId } from "@/prisma";
import classes from "./AvatarPicker.module.css";

type GameWithAvatars = {
	gameId: GameId;
	label: string;
	avatars: GameAvatar[];
};

const gamesWithAvatars: GameWithAvatars[] = REGISTERED_GAME_IDS.flatMap(
	(id) => {
		const config = getGameConfig(id);
		const avatars = getGameAvatars(id);
		if (!avatars?.length || !config) return [];
		return [{ gameId: id as GameId, label: config.METADATA.label, avatars }];
	},
);

function findAvatarImage(
	avatarId: string,
	gameId: GameId,
): { avatar: GameAvatar; imageUrl: string } | null {
	const avatars = getGameAvatars(gameId);
	const avatar = avatars?.find((a) => a.id === avatarId);
	if (!avatar) return null;
	return { avatar, imageUrl: avatarImageUrl(avatar.imageUrl, gameId) };
}

function getDefaultBrowsingGameId(
	currentGameId: GameId,
	favoriteGameIds: GameId[],
): GameId {
	if (currentGameId !== "none") {
		const hasAvatars = gamesWithAvatars.some((g) => g.gameId === currentGameId);
		if (hasAvatars) return currentGameId;
	}
	const firstFavorite = gamesWithAvatars.find((g) =>
		favoriteGameIds.includes(g.gameId),
	);
	if (firstFavorite) return firstFavorite.gameId;
	if (gamesWithAvatars.length > 0) return gamesWithAvatars[0].gameId;
	return "none" as GameId;
}

export function AvatarPicker() {
	const gameId = useGameId();
	const { profile, updateAvatar, removePrimaryAvatar, removeAvatarOverride } =
		useUserProfile();
	const favoritesQuery = useDalQuery(favoriteGameActions.list, undefined);
	const favoriteGameIds: GameId[] = (favoritesQuery.data ?? []).map(
		(f) => f.gameId,
	);

	const currentPrimaryAvatarId = profile?.primaryAvatarId ?? null;
	const currentPrimaryAvatarGameId = profile?.primaryAvatarGameId ?? null;
	const avatarOverrides = profile?.avatarOverrides ?? [];

	const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
	const [selectedGameId, setSelectedGameId] = useState<GameId | null>(null);
	const [browsingGameId, setBrowsingGameId] = useState<GameId>(() =>
		getDefaultBrowsingGameId(gameId, favoriteGameIds),
	);
	const [gameSearch, setGameSearch] = useState("");
	const [
		gamePickerOpened,
		{ toggle: toggleGamePicker, close: closeGamePicker },
	] = useDisclosure(false);

	const browsingGame = gamesWithAvatars.find(
		(g) => g.gameId === browsingGameId,
	);
	const BrowsingGameLogo = browsingGame
		? getGameLogoComponent(browsingGame.gameId)
		: undefined;
	const overrideForBrowsedGame = avatarOverrides.find(
		(o) => o.gameId === browsingGameId,
	);
	const hasOverride = overrideForBrowsedGame !== undefined;
	const hasSelection = selectedAvatarId !== null && selectedGameId !== null;

	const primaryAvatar =
		currentPrimaryAvatarId && currentPrimaryAvatarGameId
			? findAvatarImage(currentPrimaryAvatarId, currentPrimaryAvatarGameId)
			: null;

	const browsingGameOverride =
		browsingGameId !== "none"
			? avatarOverrides.find((o) => o.gameId === browsingGameId)
			: null;
	const gameSpecificAvatar = browsingGameOverride
		? findAvatarImage(
				browsingGameOverride.avatarId,
				browsingGameOverride.avatarGameId,
			)
		: null;

	const filteredGames = gamesWithAvatars.filter((g) =>
		g.label.toLowerCase().includes(gameSearch.toLowerCase()),
	);
	const favoriteGames = filteredGames
		.filter((g) => favoriteGameIds.includes(g.gameId))
		.sort((a, b) => a.label.localeCompare(b.label));
	const otherGames = filteredGames
		.filter((g) => !favoriteGameIds.includes(g.gameId))
		.sort((a, b) => a.label.localeCompare(b.label));

	const handleGameChange = (newGameId: GameId) => {
		setBrowsingGameId(newGameId);
		setSelectedAvatarId(null);
		setSelectedGameId(null);
		closeGamePicker();
		setGameSearch("");
	};

	const handleAvatarClick = (avatarId: string, avatarGameId: GameId) => {
		if (selectedAvatarId === avatarId && selectedGameId === avatarGameId) {
			setSelectedAvatarId(null);
			setSelectedGameId(null);
		} else {
			setSelectedAvatarId(avatarId);
			setSelectedGameId(avatarGameId);
		}
	};

	const handleSelectPrimary = async () => {
		if (!selectedAvatarId || !selectedGameId) return;
		setSelectedAvatarId(null);
		setSelectedGameId(null);
		await updateAvatar({
			avatarId: selectedAvatarId,
			avatarGameId: selectedGameId,
		});
	};

	const handleRemovePrimary = async () => {
		await removePrimaryAvatar();
	};

	const handleSetOverride = async () => {
		if (!selectedAvatarId || !selectedGameId) return;
		setSelectedAvatarId(null);
		setSelectedGameId(null);
		await updateAvatar({
			avatarId: selectedAvatarId,
			avatarGameId: selectedGameId,
			targetGameId: browsingGameId,
		});
	};

	const handleRemoveOverride = async (targetGameId: GameId) => {
		await removeAvatarOverride(targetGameId);
	};

	const renderAvatar = (avatar: GameAvatar, game: GameWithAvatars) => {
		const isPrimary =
			avatar.id === currentPrimaryAvatarId &&
			game.gameId === currentPrimaryAvatarGameId;
		const isOverride =
			avatar.id === overrideForBrowsedGame?.avatarId &&
			game.gameId === browsingGameId;
		const isSelected =
			avatar.id === selectedAvatarId && game.gameId === selectedGameId;

		let buttonClass = classes.avatarButton;
		if (isSelected) {
			buttonClass += ` ${classes.avatarButtonSelected}`;
		} else if (isOverride) {
			buttonClass += ` ${classes.avatarButtonOverride}`;
		} else if (isPrimary) {
			buttonClass += ` ${classes.avatarButtonPrimary}`;
		}

		return (
			<Tooltip
				key={`${avatar.id}-${game.gameId}`}
				label={
					<Stack gap={2}>
						<Text size="xs" fw={600}>
							{avatar.name}
						</Text>
						{isPrimary && (
							<Badge size="xs" color="primary">
								Primary
							</Badge>
						)}
						{isOverride && (
							<Badge size="xs" color="accent">
								{game.label} override
							</Badge>
						)}
					</Stack>
				}
				position="top"
			>
				<UnstyledButton
					className={buttonClass}
					onClick={() => handleAvatarClick(avatar.id, game.gameId)}
				>
					<Stack gap={4} align="center">
						<Avatar
							src={avatarImageUrl(avatar.imageUrl, game.gameId)}
							alt={avatar.name}
							size={56}
							radius="sm"
						/>
						{(isPrimary || isOverride) && (
							<LuCheck
								size={14}
								color={
									isOverride
										? "var(--mantine-color-accent-5)"
										: "var(--mantine-color-primary-5)"
								}
							/>
						)}
					</Stack>
				</UnstyledButton>
			</Tooltip>
		);
	};

	const renderAvatarGrid = (game: GameWithAvatars) => {
		const categories = [
			...new Set(game.avatars.map((a) => a.category).filter(Boolean)),
		] as string[];
		const hasCategories = categories.length > 1;

		return (
			<Stack gap="xs">
				{hasCategories ? (
					categories.map((category) => (
						<Stack gap={4} key={category}>
							<Text size="xs" c="dimmed" tt="uppercase" fw={600}>
								{category}
							</Text>
							<SimpleGrid cols={6} spacing="xs">
								{game.avatars
									.filter((a) => a.category === category)
									.map((avatar) => renderAvatar(avatar, game))}
							</SimpleGrid>
						</Stack>
					))
				) : (
					<SimpleGrid cols={6} spacing="xs">
						{game.avatars.map((avatar) => renderAvatar(avatar, game))}
					</SimpleGrid>
				)}
			</Stack>
		);
	};

	const renderGameRow = (game: GameWithAvatars, compact: boolean) => {
		const LogoComponent = getGameLogoComponent(game.gameId);
		return (
			<UnstyledButton
				key={game.gameId}
				className={`${classes.gameRow} ${compact ? classes.gameRowCompact : ""}`}
				onClick={() => handleGameChange(game.gameId)}
			>
				<Flex align="center" gap={compact ? "sm" : "md"}>
					{LogoComponent && <LogoComponent size={compact ? 24 : 36} />}
					<Text size={compact ? "sm" : "md"} fw={500}>
						{game.label}
					</Text>
				</Flex>
			</UnstyledButton>
		);
	};

	return (
		<Stack gap="md">
			<Text size="xs" c="dimmed">
				Your primary avatar is used everywhere. Set a game-specific avatar to
				override it when viewing or sharing pages for that game.
			</Text>

			<Group gap="lg">
				<Group gap="xs">
					<Avatar src={primaryAvatar?.imageUrl} size={40} radius="sm" />
					<Stack gap={0}>
						<Text size="xs" fw={600}>
							Primary
						</Text>
						<Text size="xs" c="dimmed">
							{primaryAvatar ? primaryAvatar.avatar.name : "Not set"}
						</Text>
					</Stack>
					{primaryAvatar && (
						<Tooltip label="Remove primary avatar">
							<ActionIcon
								variant="subtle"
								color="red"
								size="xs"
								onClick={handleRemovePrimary}
							>
								<LuX size={12} />
							</ActionIcon>
						</Tooltip>
					)}
				</Group>
				{browsingGameId !== "none" && (
					<>
						<Divider orientation="vertical" />
						<Group gap="xs">
							<Avatar
								src={gameSpecificAvatar?.imageUrl}
								size={40}
								radius="sm"
							/>
							<Stack gap={0}>
								<Text size="xs" fw={600}>
									{getGameConfig(browsingGameId)?.METADATA.label ??
										browsingGameId}
								</Text>
								<Text size="xs" c="dimmed">
									{gameSpecificAvatar
										? gameSpecificAvatar.avatar.name
										: "Using primary"}
								</Text>
							</Stack>
							{gameSpecificAvatar && (
								<Tooltip
									label={`Remove ${getGameConfig(browsingGameId)?.METADATA.label} override`}
								>
									<ActionIcon
										variant="subtle"
										color="red"
										size="xs"
										onClick={() => handleRemoveOverride(browsingGameId)}
									>
										<LuX size={12} />
									</ActionIcon>
								</Tooltip>
							)}
						</Group>
					</>
				)}
			</Group>

			<Divider />

			<Popover
				width="target"
				position="bottom-start"
				shadow="md"
				opened={gamePickerOpened}
				onChange={(isOpen) => {
					if (!isOpen) {
						closeGamePicker();
						setGameSearch("");
					}
				}}
				trapFocus
			>
				<Popover.Target>
					<UnstyledButton
						className={classes.gameSelectorButton}
						onClick={toggleGamePicker}
					>
						<Group wrap="nowrap" gap="sm" justify="space-between">
							<Flex align="center" gap="sm">
								{BrowsingGameLogo && <BrowsingGameLogo size={36} />}
								<Text size="sm" fw={600}>
									{browsingGame?.label ?? "Select a game"}
								</Text>
							</Flex>
							<LuChevronDown size={16} />
						</Group>
					</UnstyledButton>
				</Popover.Target>

				<Popover.Dropdown className={classes.gameSelectorDropdown}>
					{gamesWithAvatars.length > 3 && (
						<TextInput
							placeholder="Search games..."
							leftSection={<LuSearch size={16} />}
							value={gameSearch}
							onChange={(e) => setGameSearch(e.currentTarget.value)}
							className={classes.searchInput}
							size="sm"
							data-autofocus
						/>
					)}

					<ScrollArea.Autosize mah={300} type="auto">
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
									{favoriteGames.map((game) => renderGameRow(game, false))}
								</Stack>
								{otherGames.length > 0 && (
									<Divider my="xs" className={classes.separator} />
								)}
							</>
						)}

						{otherGames.length > 0 && (
							<>
								{favoriteGames.length > 0 && (
									<Text
										size="xs"
										c="dimmed"
										tt="uppercase"
										fw={700}
										px="xs"
										pt="xs"
										pb={4}
									>
										All Other Games
									</Text>
								)}
								<Stack gap={4}>
									{otherGames.map((game) =>
										renderGameRow(game, favoriteGames.length > 0),
									)}
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

			<ScrollArea.Autosize mah={400} type="auto">
				{browsingGame ? (
					renderAvatarGrid(browsingGame)
				) : (
					<Text c="dimmed" ta="center" py="xl" size="sm">
						No avatars available
					</Text>
				)}
			</ScrollArea.Autosize>

			<Group justify="space-between">
				<Group gap="xs">
					{hasOverride && browsingGame && (
						<Button
							variant="subtle"
							color="red"
							size="xs"
							onClick={() => handleRemoveOverride(browsingGameId)}
						>
							Remove {browsingGame.label} override
						</Button>
					)}
				</Group>
				<Group gap="xs">
					{hasSelection && browsingGame && (
						<Button variant="light" size="sm" onClick={handleSetOverride}>
							Set for {browsingGame.label}
						</Button>
					)}
					<Button
						size="sm"
						disabled={!hasSelection}
						onClick={handleSelectPrimary}
					>
						Set as primary
					</Button>
				</Group>
			</Group>
		</Stack>
	);
}
