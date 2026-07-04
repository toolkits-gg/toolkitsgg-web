import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { CollectedItemRecord } from "#/features/game/data/types.ts";
import {
	collectItem,
	listCollectedItems,
	listCollectedItemsByUserId,
	uncollectItem,
} from "#/games/remnant2/data/collected-items/collected-items.server.ts";

const CollectInput = z.object({ itemId: z.string().min(1) });
const ListByUserIdInput = z.object({ userId: z.string().min(1) });

export const collectItemServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => CollectInput.parse(v))
	.handler(
		async ({ data }): Promise<CollectedItemRecord> => collectItem(data.itemId),
	);

export const uncollectItemServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => CollectInput.parse(v))
	.handler(async ({ data }) => uncollectItem(data.itemId));

export const listCollectedItemsServerFn = createServerFn({
	method: "GET",
}).handler(async (): Promise<CollectedItemRecord[]> => listCollectedItems());

export const listCollectedItemsByUserIdServerFn = createServerFn({
	method: "POST",
})
	.validator((v: unknown) => ListByUserIdInput.parse(v))
	.handler(
		async ({ data }): Promise<CollectedItemRecord[]> =>
			listCollectedItemsByUserId(data.userId),
	);
