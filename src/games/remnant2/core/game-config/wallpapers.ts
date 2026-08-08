import type { GameWallpaper } from "#/features/game/types";
import wallpapers from "#/games/remnant2/core/game-config/wallpapers.json" with {
	type: "json",
};

/**
 * Kept as JSON rather than derived from the enemy modules because gulpfile.js
 * generates the resized variants and cannot import TypeScript. Real screenshot
 * art won't correspond to enemy records anyway.
 */
const WALLPAPERS: GameWallpaper[] = wallpapers;

export { WALLPAPERS };
