import { gameAssetPath } from "#/features/game/game-asset-url";
import type { GameWallpaper } from "#/features/game/types";
import {
	DEFAULT_IMAGE_FIT,
	type ImageFit,
} from "#/features/image-position/image-fit";
import {
	getGameWallpapers,
	REGISTERED_GAME_IDS,
} from "#/games-registry/public-registry";
import {
	youtubeThumbnailFallbackUrl,
	youtubeThumbnailUrl,
	youtubeThumbnailVideoId,
} from "#/integrations/youtube/utils";
import type { GameId } from "@/prisma";

/**
 * Roughly the shape of a build card's image (a fixed 140px tall against a card
 * that is a few hundred pixels wide). The framing editor and the field's own
 * preview both use it so a build is cropped the same way everywhere it is
 * previewed; the card itself just fills whatever width the grid gives it.
 */
const BUILD_CARD_ASPECT_RATIO = 2.2;

/** Rendered when a build has no image, and when its image fails to load. */
const BUILD_IMAGE_PLACEHOLDER = "/placeholder-build.svg";

/** Every legal wallpaper path across every registered game. */
const ALLOWED_WALLPAPER_PATHS: ReadonlySet<string> = new Set(
	REGISTERED_GAME_IDS.flatMap((gameId) =>
		(getGameWallpapers(gameId) ?? []).map((wallpaper) =>
			gameAssetPath(wallpaper.imageUrl, gameId as GameId),
		),
	),
);

/**
 * The stored form of a wallpaper chosen as a build image. The game is encoded
 * in the path, which is what lets a build use another game's art without a
 * second column.
 */
const wallpaperToBuildImageUrl = (
	wallpaper: GameWallpaper,
	gameId: GameId,
): string => gameAssetPath(wallpaper.imageUrl, gameId);

/** The build image derived from a build's video, or null if there isn't one. */
const videoToBuildImageUrl = (
	videoUrl: string | null | undefined,
): string | null => youtubeThumbnailUrl(videoUrl);

/** Whether a stored build image is a video's thumbnail rather than a wallpaper. */
const isVideoBuildImage = (value: string | null | undefined): boolean =>
	youtubeThumbnailVideoId(value) !== null;

/**
 * Guards the write path. Build images deliberately skip moderation review,
 * which is safe precisely because only two shapes get past here: a path into a
 * curated wallpaper list, and a thumbnail derived from a video URL that does
 * get reviewed. Enforced server-side in the build input schema, not just in the
 * picker, because the server fn is reachable directly.
 */
const isAllowedBuildImageUrl = (value: string): boolean =>
	isVideoBuildImage(value) || ALLOWED_WALLPAPER_PATHS.has(value);

/**
 * The fit a freshly picked image starts at. Video thumbnails carry text laid
 * out for the full 16:9 frame, so cropping them to a card's letterbox shape
 * cuts the part the uploader put there deliberately.
 */
const defaultBuildImageFit = (value: string | null | undefined): ImageFit =>
	isVideoBuildImage(value) ? "contain" : DEFAULT_IMAGE_FIT;

/**
 * What to render if a build image 404s. Only the `maxresdefault` thumbnail
 * actually can, and it degrades to the variant that exists for every video
 * rather than all the way to the placeholder.
 */
const buildImageFallbackUrl = (value: string | null | undefined): string =>
	youtubeThumbnailFallbackUrl(value) ?? BUILD_IMAGE_PLACEHOLDER;

/** Resolves a stored build image back to the wallpaper it came from, if any. */
const buildImageUrlToWallpaper = (
	value: string | null | undefined,
): { wallpaper: GameWallpaper; gameId: GameId } | null => {
	if (!value) return null;
	for (const gameId of REGISTERED_GAME_IDS) {
		const wallpapers = getGameWallpapers(gameId) ?? [];
		const wallpaper = wallpapers.find(
			(w) => gameAssetPath(w.imageUrl, gameId as GameId) === value,
		);
		if (wallpaper) return { wallpaper, gameId: gameId as GameId };
	}
	return null;
};

export {
	BUILD_CARD_ASPECT_RATIO,
	BUILD_IMAGE_PLACEHOLDER,
	buildImageFallbackUrl,
	buildImageUrlToWallpaper,
	defaultBuildImageFit,
	isAllowedBuildImageUrl,
	videoToBuildImageUrl,
	wallpaperToBuildImageUrl,
};
