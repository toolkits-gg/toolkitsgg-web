import type { CollectedItemRecord } from "#/features/game/data/types.ts";
import { requireUserId } from "#/features/user/require-user.server.ts";
import { enforceUserWriteLimit } from "#/integrations/rate-limiter-flexible/enforce-user-write-limit.ts";
import { prisma } from "@/prisma";

export const collectItem = async (
	itemId: string,
): Promise<CollectedItemRecord> => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	return prisma.remnant2CollectedItem.upsert({
		where: { userId_itemId: { userId, itemId } },
		update: {},
		create: { userId, itemId },
	});
};

export const uncollectItem = async (itemId: string) => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	await prisma.remnant2CollectedItem.deleteMany({ where: { userId, itemId } });
	return { ok: true as const };
};

export const listCollectedItems = async (): Promise<CollectedItemRecord[]> => {
	const userId = await requireUserId();
	return prisma.remnant2CollectedItem.findMany({ where: { userId } });
};

export const listCollectedItemsByUserId = (
	userId: string,
): Promise<CollectedItemRecord[]> =>
	prisma.remnant2CollectedItem.findMany({ where: { userId } });
