import type { CollectedItemRecord } from "#/features/game/data/types.ts";
import { requireUserId } from "#/features/user/require-user.server.ts";
import { enforceUserWriteLimit } from "#/integrations/rate-limiter-flexible/enforce-user-write-limit.ts";
import { prisma } from "@/prisma";

const collectItem = async (itemId: string): Promise<CollectedItemRecord> => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	return prisma.slayTheSpire2CollectedItem.upsert({
		where: { userId_itemId: { userId, itemId } },
		update: {},
		create: { userId, itemId },
	});
};

const uncollectItem = async (itemId: string) => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	await prisma.slayTheSpire2CollectedItem.deleteMany({
		where: { userId, itemId },
	});
	return { ok: true as const };
};

const listCollectedItems = async (): Promise<CollectedItemRecord[]> => {
	const userId = await requireUserId();
	return prisma.slayTheSpire2CollectedItem.findMany({ where: { userId } });
};

const listCollectedItemsByUserId = (
	userId: string,
): Promise<CollectedItemRecord[]> =>
	prisma.slayTheSpire2CollectedItem.findMany({ where: { userId } });

export {
	collectItem,
	listCollectedItems,
	listCollectedItemsByUserId,
	uncollectItem,
};
