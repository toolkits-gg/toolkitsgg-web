import { createPresenceToggleSyncHandler } from "#/features/dal/core/presence-sync-handler.ts";
import { GameId, prisma } from "@/prisma";

const favoriteGameSyncHandler = createPresenceToggleSyncHandler<GameId>({
	resolveKey: (op) => {
		const payload = op.payload as { gameId?: string } | null;
		const rawGameId = payload?.gameId;
		if (!rawGameId) return { ok: false, message: "missing gameId" };
		const gameId = GameId[rawGameId as keyof typeof GameId];
		if (!gameId) return { ok: false, message: `unknown gameId ${rawGameId}` };
		return { ok: true, key: gameId };
	},
	findRecord: (userId, gameId) =>
		prisma.userFavoriteGame.findUnique({
			where: { userId_gameId: { userId, gameId } },
		}),
	deleteRecord: async (userId, gameId) => {
		await prisma.userFavoriteGame.deleteMany({ where: { userId, gameId } });
	},
	createRecord: async (userId, gameId) => {
		await prisma.userFavoriteGame.create({ data: { userId, gameId } });
	},
});

export { favoriteGameSyncHandler };
