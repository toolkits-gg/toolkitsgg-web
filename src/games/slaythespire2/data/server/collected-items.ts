// Slay the Spire 2 collected items: server functions (Postgres via Prisma) and the
// offline-sync handler. Hand-written per game — the small amount of duplication
// across games is intentional and keeps each game's data access self-contained.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { CollectedItemRecord } from "#/features/game/data/types.ts";
import { createPresenceToggleSyncHandler } from "#/features/sync/presence-sync-handler.ts";
import type { SyncHandler } from "#/features/sync/types.ts";
import { prisma } from "@/prisma";

const CollectInput = z.object({ itemId: z.string().min(1) });
const ListByUserIdInput = z.object({ userId: z.string().min(1) });

const collectItemServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => CollectInput.parse(v))
	.handler(async ({ data }): Promise<CollectedItemRecord> => {
		const { prisma } = await import("@/prisma");
		const { requireUserId } = await import(
			"#/features/user/require-user.server.ts"
		);
		const userId = await requireUserId();
		return prisma.slayTheSpire2CollectedItem.upsert({
			where: { userId_itemId: { userId, itemId: data.itemId } },
			update: {},
			create: { userId, itemId: data.itemId },
		});
	});

const uncollectItemServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => CollectInput.parse(v))
	.handler(async ({ data }) => {
		const { prisma } = await import("@/prisma");
		const { requireUserId } = await import(
			"#/features/user/require-user.server.ts"
		);
		const userId = await requireUserId();
		await prisma.slayTheSpire2CollectedItem.deleteMany({
			where: { userId, itemId: data.itemId },
		});
		return { ok: true as const };
	});

const listCollectedItemsServerFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<CollectedItemRecord[]> => {
		const { prisma } = await import("@/prisma");
		const { requireUserId } = await import(
			"#/features/user/require-user.server.ts"
		);
		return prisma.slayTheSpire2CollectedItem.findMany({
			where: { userId: await requireUserId() },
		});
	},
);

const listCollectedItemsByUserIdServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => ListByUserIdInput.parse(v))
	.handler(
		async ({ data }): Promise<CollectedItemRecord[]> =>
			prisma.slayTheSpire2CollectedItem.findMany({
				where: { userId: data.userId },
			}),
	);

/** Offline-sync handler for the slayTheSpire2CollectedItem entity (presence toggle). */
const slayTheSpire2CollectedItemHandler: SyncHandler =
	createPresenceToggleSyncHandler<string>({
		resolveKey: (op) => {
			const itemId = (op.payload as { itemId?: string } | null)?.itemId;
			return itemId
				? { ok: true, key: itemId }
				: { ok: false, message: "missing itemId" };
		},
		findRecord: async (userId, itemId) => {
			const { prisma } = await import("@/prisma");
			return prisma.slayTheSpire2CollectedItem.findUnique({
				where: { userId_itemId: { userId, itemId } },
			});
		},
		deleteRecord: async (userId, itemId) => {
			const { prisma } = await import("@/prisma");
			await prisma.slayTheSpire2CollectedItem.deleteMany({
				where: { userId, itemId },
			});
		},
		createRecord: async (userId, itemId) => {
			const { prisma } = await import("@/prisma");
			await prisma.slayTheSpire2CollectedItem.create({
				data: { userId, itemId },
			});
		},
	});

export {
	collectItemServerFn,
	listCollectedItemsByUserIdServerFn,
	listCollectedItemsServerFn,
	slayTheSpire2CollectedItemHandler,
	uncollectItemServerFn,
};
