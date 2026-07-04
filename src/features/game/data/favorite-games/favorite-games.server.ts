import { requireUserId } from "#/features/user/require-user.server.ts";
import { enforceUserWriteLimit } from "#/integrations/rate-limiter-flexible/user-write-limit.server.ts";
import { type GameId, prisma } from "@/prisma";

const favoriteGame = async (gameId: GameId) => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	return prisma.userFavoriteGame.upsert({
		where: { userId_gameId: { userId, gameId } },
		update: {},
		create: { userId, gameId },
	});
};

const unfavoriteGame = async (gameId: GameId) => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	await prisma.userFavoriteGame.deleteMany({ where: { userId, gameId } });
	return { ok: true as const };
};

const listFavoriteGames = async () => {
	const userId = await requireUserId();
	return prisma.userFavoriteGame.findMany({ where: { userId } });
};

export { favoriteGame, listFavoriteGames, unfavoriteGame };
