import { gameAssetImageUrl } from "#/features/game/game-asset-url";
import type { GameWallpaper } from "#/features/game/types";
import WALLPAPER_SIZES from "#/features/wallpaper/wallpaper-sizes.json";
import type { GameId } from "@/prisma";

type WallpaperSize = keyof typeof WALLPAPER_SIZES;

/**
 * The resized-variant path for a wallpaper.
 *
 * `"/enemies/boss/x.jpg"` -> `"/enemies/boss/resized/x-480x270.jpg"`.
 *
 * This layout is also produced by `expectedOutputPath` in gulpfile.js, which
 * writes the files. The two must agree; the test alongside this module pins the
 * format so a change here fails loudly rather than silently 404ing on the CDN.
 */
const wallpaperVariantPath = (
	imageUrl: string,
	size: WallpaperSize,
): string => {
	const [width, height] = WALLPAPER_SIZES[size];
	const lastSlash = imageUrl.lastIndexOf("/");
	const dir = imageUrl.slice(0, lastSlash + 1);
	const file = imageUrl.slice(lastSlash + 1);
	const lastDot = file.lastIndexOf(".");
	const base = lastDot === -1 ? file : file.slice(0, lastDot);
	const ext = lastDot === -1 ? "" : file.slice(lastDot);
	return `${dir}resized/${base}-${width}x${height}${ext}`;
};

/**
 * The URL a grid or preview should render. Falls back to the wallpaper's own
 * `thumbnailUrl` when it opts out of the derived path.
 */
const wallpaperVariantUrl = (
	wallpaper: GameWallpaper,
	gameId: GameId,
	size: WallpaperSize,
): string => {
	if (size === "thumb" && wallpaper.thumbnailUrl) {
		return gameAssetImageUrl(wallpaper.thumbnailUrl, gameId);
	}
	return gameAssetImageUrl(
		wallpaperVariantPath(wallpaper.imageUrl, size),
		gameId,
	);
};

/**
 * The original, full-size asset. Used for downloads, and as the `fallbackSrc`
 * for every variant so a not-yet-uploaded resize degrades to the source image
 * instead of a broken tile.
 */
const wallpaperFullUrl = (wallpaper: GameWallpaper, gameId: GameId): string =>
	gameAssetImageUrl(wallpaper.imageUrl, gameId);

export { wallpaperFullUrl, wallpaperVariantPath, wallpaperVariantUrl };
