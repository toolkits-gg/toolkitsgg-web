import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUserId } from "#/features/auth/require-user.server.ts";
import { GameId, prisma } from "@/prisma";

const FavoriteInput = z.object({ gameId: z.enum(GameId) });

const favoriteGameServerFn = createServerFn({ method: "POST" })
	.inputValidator((v: unknown) => FavoriteInput.parse(v))
	.handler(async ({ data }) => {
		const userId = await requireUserId();
		return prisma.userFavoriteGame.upsert({
			where: { userId_gameId: { userId, gameId: data.gameId } },
			update: {},
			create: { userId, gameId: data.gameId },
		});
	});

const unfavoriteGameServerFn = createServerFn({ method: "POST" })
	.inputValidator((v: unknown) => FavoriteInput.parse(v))
	.handler(async ({ data }) => {
		const userId = await requireUserId();
		await prisma.userFavoriteGame.deleteMany({
			where: { userId, gameId: data.gameId },
		});
		return { ok: true as const };
	});

const listFavoriteGamesServerFn = createServerFn({
	method: "GET",
}).handler(async () => {
	const userId = await requireUserId();
	return prisma.userFavoriteGame.findMany({ where: { userId } });
});

export {
	favoriteGameServerFn,
	listFavoriteGamesServerFn,
	unfavoriteGameServerFn,
};
