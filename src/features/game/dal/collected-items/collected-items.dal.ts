// Reusable DAL actions for any game's collected-item feature.
// Each game instantiates this with its own entity name, IDB model accessor, and server functions.

import { defineDalRead, defineDalWrite } from "#/features/dal/define-action.ts";
import type { DalContext } from "#/features/dal/types.ts";
import {
	type CollectedItemIDBDelegate,
	createCollectedItemsIdb,
	type IDBClient,
} from "#/features/game/dal/collected-items/collected-items.idb.ts";
import type {CollectedItemRecord, CollectItemInput, GameCollectedItemsDal} from "#/features/game/dal/types.ts";

/** TanStack Start server functions injected per game. */
interface CollectedItemServerFns {
	collectItemServerFn(opts: {
		data: CollectItemInput;
	}): Promise<CollectedItemRecord>;
	uncollectItemServerFn(opts: {
		data: CollectItemInput;
	}): Promise<{ ok: true }>;
	listCollectedItemsServerFn(): Promise<CollectedItemRecord[]>;
	listCollectedItemsByUserIdServerFn(opts: {
		data: { userId: string };
	}): Promise<CollectedItemRecord[]>;
}

/**
 * Creates a GameCollectedItemsDal for a specific game.
 * `entityName` is the string key used in the sync-handler registry and for TanStack Query cache namespacing.
 * `getModel` extracts the game-specific IDB delegate from the shared IDB client.
 */
const createCollectedItemsDal = (config: {
	entityName: string;
	getModel: (idb: IDBClient) => CollectedItemIDBDelegate;
	serverFns: CollectedItemServerFns;
}): GameCollectedItemsDal => {
	const { entityName, getModel, serverFns } = config;
	const idb = createCollectedItemsIdb(getModel);

	// Reads the pre-write `updatedAt` of the local record as the LWW baseline.
	// Shared by collect and uncollect — both need the same snapshot.
	const readServerUpdatedAt = (
		input: CollectItemInput,
		ctx: DalContext,
	): Promise<string | null> =>
		idb.readUpdatedAt(ctx.authUserId ?? ctx.anonUserId, input.itemId);

	return {
		list: defineDalRead({
			queryKey: () => [entityName, "list"] as const,
			remote: async () => serverFns.listCollectedItemsServerFn(),
			local: async (_input, ctx) => {
				const userId = ctx.authUserId ?? ctx.anonUserId;
				if (!userId) return [];
				return idb.list(userId);
			},
		}),

		collect: defineDalWrite({
			entity: entityName,
			operation: "upsert",
			invalidates: [entityName],
			buildIdempotencyKey: (input, ctx) =>
				`${entityName}:upsert:${ctx.anonUserId}:${input.itemId}`,
			describe: (input) => ({
				title: `Collected: ${input.itemName}`,
			}),
			getServerUpdatedAt: readServerUpdatedAt,
			remote: async (input) => serverFns.collectItemServerFn({ data: input }),
			local: async (input, ctx) =>
				idb.collect(ctx.authUserId ?? ctx.anonUserId, input.itemId),
		}),

		uncollect: defineDalWrite({
			entity: entityName,
			operation: "delete",
			invalidates: [entityName],
			buildIdempotencyKey: (input, ctx) =>
				`${entityName}:delete:${ctx.anonUserId}:${input.itemId}`,
			describe: (input) => ({
				title: `Uncollected: ${input.itemName}`,
			}),
			getServerUpdatedAt: readServerUpdatedAt,
			remote: async (input) => serverFns.uncollectItemServerFn({ data: input }),
			local: async (input, ctx) => {
				await idb.uncollect(ctx.authUserId ?? ctx.anonUserId, input.itemId);
				return { ok: true as const };
			},
		}),

		listByUserIdServerFn: serverFns.listCollectedItemsByUserIdServerFn,
	};
};

export { createCollectedItemsDal };
