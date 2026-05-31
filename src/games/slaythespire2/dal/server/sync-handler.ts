import { createCollectedItemSyncHandler } from "#/features/game/dal/collected-items/sync-handler.ts";
import { prisma } from "@/prisma";

export const collectedItemSyncHandler = createCollectedItemSyncHandler(
	prisma.slayTheSpire2CollectedItem,
);
