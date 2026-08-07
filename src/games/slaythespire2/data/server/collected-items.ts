// Slay the Spire 2 collected items: input validation and the TanStack server-fn
// wrappers. Each wrapper delegates to ./collected-items.server.ts; those imports
// are referenced only inside handler bodies, so the compiler strips them (and
// prisma) from the client bundle. Hand-written per game — the small amount of
// duplication across games is intentional and keeps each game self-contained.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { CollectedItemRecord } from "#/features/game/data/types.ts";
import {
	collectItem,
	listCollectedItems,
	listCollectedItemsByUserId,
	uncollectItem,
} from "#/games/slaythespire2/data/server/collected-items.server.ts";

const CollectInput = z.object({ itemId: z.string().min(1) });
const ListByUserIdInput = z.object({ userId: z.string().min(1) });

const collectItemServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => CollectInput.parse(v))
	.handler(
		async ({ data }): Promise<CollectedItemRecord> => collectItem(data.itemId),
	);

const uncollectItemServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => CollectInput.parse(v))
	.handler(async ({ data }) => uncollectItem(data.itemId));

const listCollectedItemsServerFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<CollectedItemRecord[]> => listCollectedItems(),
);

const listCollectedItemsByUserIdServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => ListByUserIdInput.parse(v))
	.handler(
		async ({ data }): Promise<CollectedItemRecord[]> =>
			listCollectedItemsByUserId(data.userId),
	);

export {
	collectItemServerFn,
	listCollectedItemsByUserIdServerFn,
	listCollectedItemsServerFn,
	uncollectItemServerFn,
};
