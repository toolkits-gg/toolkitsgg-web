import {
	ActionIcon,
	Button,
	Divider,
	Group,
	Stack,
	Text,
	Tooltip,
} from "@mantine/core";
import { useState } from "react";
import { LuX } from "react-icons/lu";
import { AppImage } from "#/components/AppImage";
import { useFavoriteGames } from "#/features/game/data/favorite-games/use-favorite-games";
import { useGameId } from "#/features/game/use-game-id";
import { ImagePositionEditor } from "#/features/image-position/ImagePositionEditor";
import {
	DEFAULT_IMAGE_POSITION,
	type ImagePosition,
} from "#/features/image-position/image-position";
import { PROFILE_BANNER_ASPECT_RATIO } from "#/features/user/header-image";
import { useResolvedHeaderImage } from "#/features/user/use-resolved-header-image";
import { useUserProfile } from "#/features/user/use-user-profile";
import {
	defaultWallpaperGameId,
	WallpaperPicker,
	type WallpaperSelection,
} from "#/features/wallpaper/WallpaperPicker";
import {
	wallpaperFullUrl,
	wallpaperVariantUrl,
} from "#/features/wallpaper/wallpaper-image";
import {
	getGameMetadata,
	getGameWallpapers,
} from "#/games-registry/public-registry";
import type { GameId } from "@/prisma";
import classes from "./HeaderImagePicker.module.css";

const findWallpaper = (headerImageId: string, headerImageGameId: GameId) =>
	getGameWallpapers(headerImageGameId)?.find((w) => w.id === headerImageId) ??
	null;

type PreviewProps = {
	label: string;
	headerImageId: string | null;
	headerImageGameId: GameId | null;
	emptyLabel: string;
	onRemove?: () => void;
	removeTooltip?: string;
};

const Preview = ({
	label,
	headerImageId,
	headerImageGameId,
	emptyLabel,
	onRemove,
	removeTooltip,
}: PreviewProps) => {
	const wallpaper =
		headerImageId && headerImageGameId
			? findWallpaper(headerImageId, headerImageGameId)
			: null;

	return (
		<Group gap="xs" wrap="nowrap">
			{wallpaper && headerImageGameId ? (
				<AppImage
					src={wallpaperVariantUrl(wallpaper, headerImageGameId, "thumb")}
					fallbackSrc={wallpaperFullUrl(wallpaper, headerImageGameId)}
					alt={wallpaper.name ?? ""}
					className={classes.preview}
				/>
			) : (
				<div className={classes.previewEmpty} />
			)}
			<Stack gap={0}>
				<Text size="xs" fw={600}>
					{label}
				</Text>
				<Text size="xs" c="dimmed">
					{wallpaper ? (wallpaper.name ?? "Selected wallpaper") : emptyLabel}
				</Text>
			</Stack>
			{wallpaper && onRemove && (
				<Tooltip label={removeTooltip}>
					<ActionIcon
						variant="subtle"
						color="red"
						size="xs"
						onClick={onRemove}
						aria-label={removeTooltip}
					>
						<LuX size={12} />
					</ActionIcon>
				</Tooltip>
			)}
		</Group>
	);
};

const HeaderImagePicker = () => {
	const activeGameId = useGameId();
	const {
		profile,
		updateHeaderImage,
		removePrimaryHeaderImage,
		removeHeaderImageOverride,
	} = useUserProfile();
	const favoritesQuery = useFavoriteGames();
	const favoriteGameIds: GameId[] = (favoritesQuery.data ?? []).map(
		(f) => f.gameId,
	);

	// The editor starts on whatever the profile is showing right now, so nudging
	// the current banner does not require re-picking it out of the grid first.
	const resolved = useResolvedHeaderImage();
	const [selection, setSelection] = useState<WallpaperSelection | null>(() =>
		resolved.wallpaper && resolved.gameId
			? { wallpaperId: resolved.wallpaper.id, wallpaperGameId: resolved.gameId }
			: null,
	);
	const [position, setPosition] = useState<ImagePosition>(
		() => resolved.position,
	);
	// Seeded from the game being viewed, never from the art's own game: this is
	// what "Set for <game>" targets, so it has to follow the user, not the image.
	const [browsingGameId, setBrowsingGameId] = useState<GameId>(() =>
		defaultWallpaperGameId(activeGameId, favoriteGameIds),
	);

	const handleGameChange = (next: GameId) => {
		setBrowsingGameId(next);
		setSelection(null);
		setPosition(DEFAULT_IMAGE_POSITION);
	};

	const selectedWallpaper = selection
		? findWallpaper(selection.wallpaperId, selection.wallpaperGameId)
		: null;

	/** Framing belongs to one image, so a different pick starts centered. */
	const handleSelect = (next: WallpaperSelection) => {
		if (
			next.wallpaperId !== selection?.wallpaperId ||
			next.wallpaperGameId !== selection?.wallpaperGameId
		) {
			setPosition(DEFAULT_IMAGE_POSITION);
		}
		setSelection(next);
	};

	const overrides = profile?.headerImageOverrides ?? [];
	// The override you can set is the one for the game you are browsing, which
	// mirrors the avatar picker and makes every game reachable from here rather
	// than only the one the page happens to be scoped to.
	const targetGameId = browsingGameId !== "none" ? browsingGameId : null;
	const override = targetGameId
		? overrides.find((o) => o.gameId === targetGameId)
		: undefined;
	const targetLabel = targetGameId
		? (getGameMetadata(targetGameId)?.label ?? targetGameId)
		: null;

	const handleSetPrimary = async () => {
		if (!selection) return;
		await updateHeaderImage({
			headerImageId: selection.wallpaperId,
			headerImageGameId: selection.wallpaperGameId,
			positionX: position.x,
			positionY: position.y,
		});
	};

	const handleSetOverride = async () => {
		if (!selection || !targetGameId) return;
		await updateHeaderImage({
			headerImageId: selection.wallpaperId,
			headerImageGameId: selection.wallpaperGameId,
			positionX: position.x,
			positionY: position.y,
			targetGameId,
		});
	};

	return (
		<Stack gap="md">
			<Text size="xs" c="dimmed">
				Your primary header is used everywhere. Set a game-specific header to
				override it when viewing or sharing pages for that game.
			</Text>

			<Group gap="lg">
				<Preview
					label="Primary"
					headerImageId={profile?.primaryHeaderImageId ?? null}
					headerImageGameId={profile?.primaryHeaderImageGameId ?? null}
					emptyLabel="Not set"
					onRemove={() => void removePrimaryHeaderImage()}
					removeTooltip="Remove primary header image"
				/>
				{targetGameId && targetLabel && (
					<>
						<Divider orientation="vertical" />
						<Preview
							label={targetLabel}
							headerImageId={override?.headerImageId ?? null}
							headerImageGameId={override?.headerImageGameId ?? null}
							emptyLabel="Using primary"
							onRemove={() => void removeHeaderImageOverride(targetGameId)}
							removeTooltip={`Remove ${targetLabel} override`}
						/>
					</>
				)}
			</Group>

			{selectedWallpaper && selection && (
				<Stack gap={4}>
					<Text size="xs" fw={600}>
						Framing
					</Text>
					<ImagePositionEditor
						src={wallpaperVariantUrl(
							selectedWallpaper,
							selection.wallpaperGameId,
							"preview",
						)}
						fallbackSrc={wallpaperFullUrl(
							selectedWallpaper,
							selection.wallpaperGameId,
						)}
						alt={selectedWallpaper.name ?? ""}
						value={position}
						onChange={setPosition}
						aspectRatio={PROFILE_BANNER_ASPECT_RATIO}
					/>
				</Stack>
			)}

			<Divider />

			<WallpaperPicker
				value={selection}
				onSelect={handleSelect}
				browsingGameId={browsingGameId}
				onBrowsingGameChange={handleGameChange}
			/>

			<Group justify="flex-end" gap="xs">
				{selection && targetGameId && targetLabel && (
					<Button variant="light" size="sm" onClick={handleSetOverride}>
						Set for {targetLabel}
					</Button>
				)}
				<Button size="sm" disabled={!selection} onClick={handleSetPrimary}>
					Set as primary
				</Button>
			</Group>
		</Stack>
	);
};

export { HeaderImagePicker };
