import type { GameWallpaper } from "#/features/game/types";
import { wallpaperFullUrl } from "#/features/wallpaper/wallpaper-image";
import type { GameId } from "@/prisma";

const fileNameFor = (wallpaper: GameWallpaper): string => {
	const extension = wallpaper.imageUrl.match(/\.[a-z0-9]+$/i)?.[0] ?? ".jpg";
	const source =
		wallpaper.name ??
		wallpaper.imageUrl.split("/").pop()?.replace(extension, "");
	const slug =
		source
			?.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "") || wallpaper.id;
	return `${slug}${extension}`;
};

/**
 * Downloads the full-size wallpaper.
 *
 * The blob round-trip is what makes this a download rather than a navigation:
 * browsers ignore the `download` attribute on a cross-origin href, and the CDN
 * is a different origin. Fetching first is allowed because CloudFront serves
 * these with `access-control-allow-origin: *`, and the resulting object URL is
 * same-origin, so `download` is honored.
 */
const downloadWallpaper = async (
	wallpaper: GameWallpaper,
	gameId: GameId,
): Promise<void> => {
	const response = await fetch(wallpaperFullUrl(wallpaper, gameId));
	if (!response.ok) {
		throw new Error(`Download failed (${response.status})`);
	}

	const objectUrl = URL.createObjectURL(await response.blob());
	try {
		const anchor = document.createElement("a");
		anchor.href = objectUrl;
		anchor.download = fileNameFor(wallpaper);
		document.body.appendChild(anchor);
		anchor.click();
		anchor.remove();
	} finally {
		URL.revokeObjectURL(objectUrl);
	}
};

export { downloadWallpaper };
