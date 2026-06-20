import { useEffect } from "react";
import { isRegisteredGameId } from "#/features/game/registry/game-registry.tsx";
import { useGameId } from "#/features/game/use-game-id.ts";

const FAVICON_BASE_PATH = "/favicons/";

const SyncFavicon = () => {
	const gameId = useGameId();

	useEffect(() => {
		const key =
			gameId !== "none" && isRegisteredGameId(gameId) ? gameId : "default";

		document
			.querySelectorAll<HTMLLinkElement>(
				'link[rel="icon"], link[rel="apple-touch-icon"]',
			)
			.forEach((link) => {
				link.href = link.href.replace(
					new RegExp(`${FAVICON_BASE_PATH}[^/]+/`),
					`${FAVICON_BASE_PATH}${key}/`,
				);
			});
	}, [gameId]);

	return null;
};

export { SyncFavicon };
