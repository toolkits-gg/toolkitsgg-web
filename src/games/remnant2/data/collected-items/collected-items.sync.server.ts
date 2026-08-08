// Sync handler for the remnant2CollectedItem entity (presence toggle).
// Split out from collected-items.server.ts so the sync-replay path lives apart
// from the direct CRUD data access. The `.server.ts` suffix opts this into
// Start's import protection, keeping prisma out of the client bundle. Consumed
// only by the sync handler registry.

import { createCollectedItemSyncHandler } from "#/features/game/data/collected-items/collected-items-sync-handler.server";
import type { SyncHandler } from "#/features/sync/types";
import { prisma } from "@/prisma";

const remnant2CollectedItemSyncHandler: SyncHandler =
	createCollectedItemSyncHandler(prisma.remnant2CollectedItem);

export { remnant2CollectedItemSyncHandler };
