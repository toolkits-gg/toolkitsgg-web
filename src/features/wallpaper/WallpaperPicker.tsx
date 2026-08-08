import {
	ScrollArea,
	SimpleGrid,
	Stack,
	Text,
	Tooltip,
	UnstyledButton,
} from "@mantine/core";
import { Fragment } from "react";
import { AppImage } from "#/components/AppImage";
import { defaultBrowsingGameId } from "#/features/game/default-browsing-game";
import { GamePickerPopover } from "#/features/game/GamePickerPopover";
import type { GameWallpaper } from "#/features/game/types";
import {
	wallpaperFullUrl,
	wallpaperVariantUrl,
} from "#/features/wallpaper/wallpaper-image";
import {
	gameHasWallpapers,
	getGameWallpapers,
	REGISTERED_GAME_IDS,
} from "#/games-registry/public-registry";
import type { GameId } from "@/prisma";
import classes from "./WallpaperPicker.module.css";

/** Games shipping wallpapers, resolved once: the registry never changes at runtime. */
const gamesWithWallpapers: GameId[] = REGISTERED_GAME_IDS.filter(
	gameHasWallpapers,
) as GameId[];

type WallpaperSelection = { wallpaperId: string; wallpaperGameId: GameId };

type WallpaperPickerProps = {
	value: WallpaperSelection | null;
	onSelect: (next: WallpaperSelection) => void;
	/** Which game's art is on screen. Owned by the consumer: it drives what a
	 *  "set for this game" action means, which is the consumer's business. */
	browsingGameId: GameId;
	onBrowsingGameChange: (next: GameId) => void;
};

/** Seeds the browsing game from a preference that may not ship wallpapers. */
const defaultWallpaperGameId = (
	preferred: GameId,
	favoriteGameIds: GameId[] = [],
): GameId =>
	defaultBrowsingGameId(preferred, favoriteGameIds, gamesWithWallpapers);

/**
 * The wallpaper grid shared by the build image picker and the profile header
 * picker. It owns browsing only: what a selection *means* is the consumer's
 * business, so it always reports the (wallpaper, game) pair and never the
 * stored form.
 */
const WallpaperPicker = ({
	value,
	onSelect,
	browsingGameId,
	onBrowsingGameChange,
}: WallpaperPickerProps) => {
	const wallpapers = getGameWallpapers(browsingGameId) ?? [];

	const renderTile = (wallpaper: GameWallpaper) => {
		const isSelected =
			value?.wallpaperId === wallpaper.id &&
			value?.wallpaperGameId === browsingGameId;

		const tile = (
			<UnstyledButton
				className={`${classes.tile} ${isSelected ? classes.tileSelected : ""}`}
				onClick={() =>
					onSelect({
						wallpaperId: wallpaper.id,
						wallpaperGameId: browsingGameId,
					})
				}
			>
				<AppImage
					src={wallpaperVariantUrl(wallpaper, browsingGameId, "thumb")}
					fallbackSrc={wallpaperFullUrl(wallpaper, browsingGameId)}
					alt={wallpaper.name ?? ""}
					loading="lazy"
					className={classes.tileImage}
				/>
			</UnstyledButton>
		);

		if (!wallpaper.name) return <Fragment key={wallpaper.id}>{tile}</Fragment>;

		return (
			<Tooltip key={wallpaper.id} label={wallpaper.name} position="top">
				{tile}
			</Tooltip>
		);
	};

	const renderGrid = (items: GameWallpaper[]) => (
		<SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="xs">
			{items.map(renderTile)}
		</SimpleGrid>
	);

	return (
		<Stack gap="md">
			<GamePickerPopover
				gameIds={gamesWithWallpapers}
				value={browsingGameId}
				onChange={onBrowsingGameChange}
			/>

			<ScrollArea.Autosize className={classes.scrollArea} type="auto">
				{wallpapers.length === 0 ? (
					<Text c="dimmed" ta="center" py="xl" size="sm">
						No wallpapers available
					</Text>
				) : (
					renderGrid(wallpapers)
				)}
			</ScrollArea.Autosize>
		</Stack>
	);
};

export { defaultWallpaperGameId, WallpaperPicker, type WallpaperSelection };
