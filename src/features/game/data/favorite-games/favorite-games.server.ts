import { requireUserId } from "#/features/user/require-user.server.ts";
import { enforceUserWriteLimit } from "#/integrations/rate-limiter-flexible/enforce-user-write-limit.ts";
import { type GameId, prisma } from "@/prisma";

export const favoriteGame = async (gameId: GameId) => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	return prisma.userFavoriteGame.upsert({
		where: { userId_gameId: { userId, gameId } },
		update: {},
		create: { userId, gameId },
	});
};

export const unfavoriteGame = async (gameId: GameId) => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	await prisma.userFavoriteGame.deleteMany({ where: { userId, gameId } });
	return { ok: true as const };
};

export const listFavoriteGames = async () => {
	const userId = await requireUserId();
	return prisma.userFavoriteGame.findMany({ where: { userId } });
};
