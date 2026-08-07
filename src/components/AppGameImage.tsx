import { AppImage, type AppImageProps } from "#/components/AppImage";
import { useGameId } from "#/features/game/use-game-id.ts";

export type AppGameImageProps = AppImageProps & {};

/**
 * Small AppImage wrapper that automatically resolves the image URL
 * based on the current game ID.
 */
const withResizedDir = (src: string) =>
	src.replace(/(^|\/)([^/]+)$/, "$1resized/$2");

export const AppGameImage = ({ src, ...rest }: AppGameImageProps) => {
	const gameId = useGameId();

	if (gameId === "none") {
		throw new Error(`Game ID is required to resolve image URL: ${src}`);
	}

	if (typeof src === "string" && !src.startsWith("http")) {
		return (
			<AppImage src={`games/${gameId}/${withResizedDir(src)}`} {...rest} />
		);
	}

	return <AppImage src={src} {...rest} />;
};
