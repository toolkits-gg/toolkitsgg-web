import type { GameId } from "@/prisma";

/**
 * Which game an asset picker should open on. The game being viewed wins, so a
 * "set for this game" action targets the game the user is actually looking at
 * rather than wherever the currently shown art happens to come from. A game
 * that ships nothing for this picker falls through to a favorite that does,
 * then to whatever ships anything at all.
 */
const defaultBrowsingGameId = (
	currentGameId: GameId,
	favoriteGameIds: GameId[],
	gameIdsWithArt: readonly GameId[],
): GameId => {
	if (gameIdsWithArt.includes(currentGameId)) return currentGameId;
	const firstFavorite = gameIdsWithArt.find((id) =>
		favoriteGameIds.includes(id),
	);
	return firstFavorite ?? gameIdsWithArt[0] ?? ("none" as GameId);
};

export { defaultBrowsingGameId };
