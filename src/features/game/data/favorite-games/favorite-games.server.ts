// Server-only data access for the userFavoriteGame entity (a presence toggle).
// The `.server.ts` suffix opts this file into Start's import protection, so
// prisma can never be pulled into the client bundle. Consumed by the
// favorite-games server-fn wrappers (inside their handlers). The offline-sync
// handler lives alongside in favorite-games.sync.server.ts.

import { requireUserId } from "#/features/user/require-user.server.ts";
import { type GameId, prisma } from "@/prisma";

const favoriteGame = async (gameId: GameId) => {
	const userId = await requireUserId();
	return prisma.userFavoriteGame.upsert({
		where: { userId_gameId: { userId, gameId } },
		update: {},
		create: { userId, gameId },
	});
};

const unfavoriteGame = async (gameId: GameId) => {
	const userId = await requireUserId();
	await prisma.userFavoriteGame.deleteMany({ where: { userId, gameId } });
	return { ok: true as const };
};

const listFavoriteGames = async () => {
	const userId = await requireUserId();
	return prisma.userFavoriteGame.findMany({ where: { userId } });
};

export { favoriteGame, listFavoriteGames, unfavoriteGame };
