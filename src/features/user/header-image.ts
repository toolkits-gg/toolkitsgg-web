import { gameAssetImageUrl } from "#/features/game/game-asset-url";
import type { GameWallpaper } from "#/features/game/types";
import {
	DEFAULT_IMAGE_POSITION,
	type ImagePosition,
	toImagePosition,
} from "#/features/image-position/image-position";
import { getGameWallpapers } from "#/games-registry/public-registry";
import type { GameId } from "@/prisma";

type ResolveHeaderImageParams = {
	primaryHeaderImageId: string | null | undefined;
	primaryHeaderImageGameId: GameId | null | undefined;
	primaryHeaderImagePositionX?: number | null;
	primaryHeaderImagePositionY?: number | null;
	overrides: Array<{
		gameId: GameId;
		headerImageId: string;
		headerImageGameId: GameId;
		headerImagePositionX?: number | null;
		headerImagePositionY?: number | null;
	}>;
	currentGameId: GameId;
};

type ResolvedHeaderImage = {
	headerImageUrl: string | null;
	wallpaper: GameWallpaper | null;
	gameId: GameId | null;
	/** Where the art sits in the banner. Centered when there is no art. */
	position: ImagePosition;
};

const NONE: ResolvedHeaderImage = {
	headerImageUrl: null,
	wallpaper: null,
	gameId: null,
	position: DEFAULT_IMAGE_POSITION,
};

const lookup = (
	headerImageId: string,
	headerImageGameId: GameId,
	position: ImagePosition,
): ResolvedHeaderImage | null => {
	const wallpaper = getGameWallpapers(headerImageGameId)?.find(
		(w) => w.id === headerImageId,
	);
	if (!wallpaper) return null;
	return {
		headerImageUrl: gameAssetImageUrl(wallpaper.imageUrl, headerImageGameId),
		wallpaper,
		gameId: headerImageGameId,
		position,
	};
};

/**
 * Per-game override beats primary, mirroring resolveAvatar. Each tier is
 * re-validated against the game's current wallpaper list, so art removed from a
 * game degrades to the next tier rather than rendering a dead URL. There is no
 * third tier: unlike avatars, nothing external ever supplies a header.
 */
const resolveHeaderImage = (
	params: ResolveHeaderImageParams,
): ResolvedHeaderImage => {
	const {
		primaryHeaderImageId,
		primaryHeaderImageGameId,
		overrides,
		currentGameId,
	} = params;

	const override = overrides.find((o) => o.gameId === currentGameId);
	if (override) {
		const resolved = lookup(
			override.headerImageId,
			override.headerImageGameId,
			toImagePosition(
				override.headerImagePositionX,
				override.headerImagePositionY,
			),
		);
		if (resolved) return resolved;
	}

	if (primaryHeaderImageId && primaryHeaderImageGameId) {
		const resolved = lookup(
			primaryHeaderImageId,
			primaryHeaderImageGameId,
			toImagePosition(
				params.primaryHeaderImagePositionX,
				params.primaryHeaderImagePositionY,
			),
		);
		if (resolved) return resolved;
	}

	return NONE;
};

/**
 * Roughly the shape of the profile banner (a fixed 120px tall against a page
 * that is usually a few hundred pixels wide). Only used to give the framing
 * editor a preview the right shape: the real banner's ratio moves with the
 * viewport, and every plausible width is wider than the art, so which axis pans
 * does not depend on getting this exact.
 */
const PROFILE_BANNER_ASPECT_RATIO = 6;

export { PROFILE_BANNER_ASPECT_RATIO, resolveHeaderImage };
