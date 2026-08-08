import {
	ActionIcon,
	Avatar,
	Badge,
	Button,
	Divider,
	Group,
	ScrollArea,
	SimpleGrid,
	Stack,
	Text,
	Tooltip,
	UnstyledButton,
} from "@mantine/core";
import { useState } from "react";
import { LuCheck, LuX } from "react-icons/lu";
import { useFavoriteGames } from "#/features/game/data/favorite-games/use-favorite-games";
import { defaultBrowsingGameId } from "#/features/game/default-browsing-game";
import { GamePickerPopover } from "#/features/game/GamePickerPopover";
import { gameAssetImageUrl } from "#/features/game/game-asset-url";
import type { GameAvatar } from "#/features/game/types";
import { useGameId } from "#/features/game/use-game-id";
import { useUserProfile } from "#/features/user/use-user-profile";
import {
	getGameAvatars,
	getGameMetadata,
	REGISTERED_GAME_IDS,
} from "#/games-registry/public-registry";
import type { GameId } from "@/prisma";
import classes from "./AvatarPicker.module.css";

type GameWithAvatars = {
	gameId: GameId;
	label: string;
	avatars: GameAvatar[];
};

const gamesWithAvatars: GameWithAvatars[] = REGISTERED_GAME_IDS.flatMap(
	(id) => {
		const avatars = getGameAvatars(id);
		const metadata = getGameMetadata(id);
		if (!avatars?.length || !metadata) return [];
		return [{ gameId: id as GameId, label: metadata.label, avatars }];
	},
);

function findAvatarImage(
	avatarId: string,
	gameId: GameId,
): { avatar: GameAvatar; imageUrl: string } | null {
	const avatars = getGameAvatars(gameId);
	const avatar = avatars?.find((a) => a.id === avatarId);
	if (!avatar) return null;
	return { avatar, imageUrl: gameAssetImageUrl(avatar.imageUrl, gameId) };
}

const gameIdsWithAvatars: GameId[] = gamesWithAvatars.map((g) => g.gameId);

export function AvatarPicker() {
	const gameId = useGameId();
	const { profile, updateAvatar, removePrimaryAvatar, removeAvatarOverride } =
		useUserProfile();
	const favoritesQuery = useFavoriteGames();
	const favoriteGameIds: GameId[] = (favoritesQuery.data ?? []).map(
		(f) => f.gameId,
	);

	const currentPrimaryAvatarId = profile?.primaryAvatarId ?? null;
	const currentPrimaryAvatarGameId = profile?.primaryAvatarGameId ?? null;
	const avatarOverrides = profile?.avatarOverrides ?? [];

	const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
	const [selectedGameId, setSelectedGameId] = useState<GameId | null>(null);
	const [browsingGameId, setBrowsingGameId] = useState<GameId>(() =>
		defaultBrowsingGameId(gameId, favoriteGameIds, gameIdsWithAvatars),
	);
	const browsingGame = gamesWithAvatars.find(
		(g) => g.gameId === browsingGameId,
	);
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

	const handleGameChange = (newGameId: GameId) => {
		setBrowsingGameId(newGameId);
		setSelectedAvatarId(null);
		setSelectedGameId(null);
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
							src={gameAssetImageUrl(avatar.imageUrl, game.gameId)}
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
									{getGameMetadata(browsingGameId)?.label ?? browsingGameId}
								</Text>
								<Text size="xs" c="dimmed">
									{gameSpecificAvatar
										? gameSpecificAvatar.avatar.name
										: "Using primary"}
								</Text>
							</Stack>
							{gameSpecificAvatar && (
								<Tooltip
									label={`Remove ${getGameMetadata(browsingGameId)?.label} override`}
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

			<GamePickerPopover
				gameIds={gamesWithAvatars.map((g) => g.gameId)}
				value={browsingGameId}
				onChange={handleGameChange}
			/>

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
