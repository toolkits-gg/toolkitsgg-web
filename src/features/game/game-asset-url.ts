import { clientEnv } from "#/env/client-env";
import type { GameId } from "@/prisma";

/**
 * The stored, CDN-relative form of a game asset: "games/<gameId>/<path>".
 *
 * This is what gets persisted for anything referencing game art by path rather
 * than by id, because AppImage resolves any non-http src against CloudFront.
 */
const gameAssetPath = (imageUrl: string, gameId: GameId): string =>
	`games/${gameId}/${imageUrl.replace(/^\//, "")}`;

/**
 * The absolute URL for a game asset. Absolute URLs pass through, which
 * is what lets externally hosted art (Discord avatar, YouTube thumbnail)
 * share the same call sites as CDN images.
 */
const gameAssetImageUrl = (imageUrl: string, gameId: GameId): string => {
	if (imageUrl.startsWith("http")) return imageUrl;
	return `${clientEnv.VITE_CLOUDFRONT_URL}/${gameAssetPath(imageUrl, gameId)}`;
};

export { gameAssetImageUrl, gameAssetPath };
