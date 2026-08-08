// Shared client data hooks for collected items. Each hook inlines the backend
// choice (remote when signed in, else local IndexedDB) and, on the local path,
// mirrors the write to IDB and enqueues a pending op for later sync.
//
// Collected items are the one entity every game has, and the logic is identical
// for all of them, so it lives here once rather than per game. Per-entity
// duplication elsewhere is deliberate; this is per-game duplication of a single
// entity, which is what the factory removes.

import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CollectedItemStore } from "#/features/game/data/collected-items/collected-item-table";
import type {
	CollectedItemRecord,
	CollectItemInput,
	GameCollectedItemsData,
} from "#/features/game/data/types";
import { toIso } from "#/features/game/data/utils";
import type { SyncableEntity } from "#/features/sync/entities";
import { getOrCreateAnonUserId } from "#/features/sync/identity/anon-id";
import { enqueueOp } from "#/features/sync/queue/pending-ops";
import { useSession } from "#/integrations/better-auth/auth-client";
import type { GameId } from "@/prisma";

type CollectedItemServerFns = {
	collectItemServerFn: (args: {
		data: { itemId: string };
	}) => Promise<CollectedItemRecord>;
	uncollectItemServerFn: (args: {
		data: { itemId: string };
	}) => Promise<{ ok: true }>;
	listCollectedItemsServerFn: () => Promise<CollectedItemRecord[]>;
	listCollectedItemsByUserIdServerFn: (args: {
		data: { userId: string };
	}) => Promise<CollectedItemRecord[]>;
};

type CollectedItemsDataConfig = {
	gameId: Exclude<GameId, "none">;
	entity: SyncableEntity;
	serverFns: CollectedItemServerFns;
	/** The game's collected-item store in the browser. */
	localStore: CollectedItemStore;
};

const createCollectedItemsData = ({
	gameId,
	entity,
	serverFns,
	localStore,
}: CollectedItemsDataConfig): GameCollectedItemsData => {
	const {
		collectItemServerFn,
		uncollectItemServerFn,
		listCollectedItemsServerFn,
		listCollectedItemsByUserIdServerFn,
	} = serverFns;

	const useList = () => {
		const { data: session } = useSession();
		const authUserId = session?.user?.id ?? null;
		const userId = authUserId ?? getOrCreateAnonUserId();
		const remote = !!authUserId;

		return useQuery({
			queryKey: ["data", entity, "list", userId],
			queryFn: async (): Promise<CollectedItemRecord[]> => {
				if (remote) return listCollectedItemsServerFn();
				if (!userId) return [];
				return localStore.findMany({ where: { userId } });
			},
		});
	};

	const usePublicList = (publicUserId: string | null) =>
		useQuery({
			queryKey: ["data", entity, "list", "byUserId", publicUserId],
			queryFn: (): Promise<CollectedItemRecord[]> =>
				publicUserId
					? listCollectedItemsByUserIdServerFn({
							data: { userId: publicUserId },
						})
					: Promise.resolve([]),
			enabled: !!publicUserId,
		});

	const useCollect = () => {
		const queryClient = useQueryClient();
		const { data: session } = useSession();

		return useMutation<CollectedItemRecord, Error, CollectItemInput>({
			mutationFn: async (input) => {
				const authUserId = session?.user?.id ?? null;
				const anonUserId = getOrCreateAnonUserId();
				if (authUserId) {
					return collectItemServerFn({ data: { itemId: input.itemId } });
				}
				const existing = await localStore.findUnique({
					where: { userId: anonUserId, itemId: input.itemId },
				});
				const record = await localStore.upsert({
					where: { userId: anonUserId, itemId: input.itemId },
					update: {},
					create: { userId: anonUserId, itemId: input.itemId },
				});
				await enqueueOp({
					anonUserId,
					entity,
					operation: "upsert",
					payload: { itemId: input.itemId, itemName: input.itemName },
					idempotencyKey: `${entity}:upsert:${anonUserId}:${input.itemId}`,
					serverUpdatedAt: toIso(existing?.updatedAt),
					summary: {
						title: `Collected: ${input.itemName}`,
						gameId,
					},
				});
				return record;
			},
			onSuccess: () =>
				queryClient.invalidateQueries({ queryKey: ["data", entity] }),
			onError: (error) =>
				notifications.show({
					title: "Could not collect item",
					message: error.message,
					color: "red",
				}),
		});
	};

	const useUncollect = () => {
		const queryClient = useQueryClient();
		const { data: session } = useSession();

		return useMutation<{ ok: true }, Error, CollectItemInput>({
			mutationFn: async (input) => {
				const authUserId = session?.user?.id ?? null;
				const anonUserId = getOrCreateAnonUserId();
				if (authUserId) {
					return uncollectItemServerFn({ data: { itemId: input.itemId } });
				}
				const existing = await localStore.findUnique({
					where: { userId: anonUserId, itemId: input.itemId },
				});
				await localStore.deleteMany({
					where: { userId: anonUserId, itemId: input.itemId },
				});
				await enqueueOp({
					anonUserId,
					entity,
					operation: "delete",
					payload: { itemId: input.itemId, itemName: input.itemName },
					idempotencyKey: `${entity}:delete:${anonUserId}:${input.itemId}`,
					serverUpdatedAt: toIso(existing?.updatedAt),
					summary: {
						title: `Uncollected: ${input.itemName}`,
						gameId,
					},
				});
				return { ok: true as const };
			},
			onSuccess: () =>
				queryClient.invalidateQueries({ queryKey: ["data", entity] }),
			onError: (error) =>
				notifications.show({
					title: "Could not uncollect item",
					message: error.message,
					color: "red",
				}),
		});
	};

	return { useList, usePublicList, useCollect, useUncollect };
};

export type { CollectedItemServerFns };
export { createCollectedItemsData };
