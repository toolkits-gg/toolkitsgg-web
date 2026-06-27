// Favorite games: server functions (Postgres via Prisma) and the offline-sync
// handler for the userFavoriteGame entity (a presence toggle).

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { REGISTERED_GAME_IDS } from "#/features/game/registry/game-public-registry.tsx";
import { createPresenceToggleSyncHandler } from "#/features/sync/presence-sync-handler.ts";
import type { SyncHandler } from "#/features/sync/types.ts";
import type { GameId } from "@/prisma";

const GAME_ID_SET = new Set<string>(REGISTERED_GAME_IDS);
const isGameId = (value: string): value is GameId => GAME_ID_SET.has(value);

const FavoriteInput = z.object({ gameId: z.string().refine(isGameId) });

const favoriteGameServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => FavoriteInput.parse(v))
	.handler(async ({ data }) => {
		const { prisma } = await import("@/prisma");
		const { requireUserId } = await import(
			"#/features/user/require-user.server.ts"
		);
		const userId = await requireUserId();
		return prisma.userFavoriteGame.upsert({
			where: { userId_gameId: { userId, gameId: data.gameId } },
			update: {},
			create: { userId, gameId: data.gameId },
		});
	});

const unfavoriteGameServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => FavoriteInput.parse(v))
	.handler(async ({ data }) => {
		const { prisma } = await import("@/prisma");
		const { requireUserId } = await import(
			"#/features/user/require-user.server.ts"
		);
		const userId = await requireUserId();
		await prisma.userFavoriteGame.deleteMany({
			where: { userId, gameId: data.gameId },
		});
		return { ok: true as const };
	});

const listFavoriteGamesServerFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const { prisma } = await import("@/prisma");
		const { requireUserId } = await import(
			"#/features/user/require-user.server.ts"
		);
		const userId = await requireUserId();
		return prisma.userFavoriteGame.findMany({ where: { userId } });
	},
);

const favoriteGameSyncHandler: SyncHandler =
	createPresenceToggleSyncHandler<GameId>({
		resolveKey: (op) => {
			const rawGameId = (op.payload as { gameId?: string } | null)?.gameId;
			if (!rawGameId) return { ok: false, message: "missing gameId" };
			if (!isGameId(rawGameId))
				return { ok: false, message: `unknown gameId ${rawGameId}` };
			const gameId = rawGameId;
			return { ok: true, key: gameId };
		},
		findRecord: async (userId, gameId) => {
			const { prisma } = await import("@/prisma");
			return prisma.userFavoriteGame.findUnique({
				where: { userId_gameId: { userId, gameId } },
			});
		},
		deleteRecord: async (userId, gameId) => {
			const { prisma } = await import("@/prisma");
			await prisma.userFavoriteGame.deleteMany({ where: { userId, gameId } });
		},
		createRecord: async (userId, gameId) => {
			const { prisma } = await import("@/prisma");
			await prisma.userFavoriteGame.create({ data: { userId, gameId } });
		},
	});

export {
	favoriteGameServerFn,
	favoriteGameSyncHandler,
	listFavoriteGamesServerFn,
	unfavoriteGameServerFn,
};
