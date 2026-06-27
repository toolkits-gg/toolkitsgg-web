// Remnant 2 collected items: client data hooks. Each hook inlines the backend
// choice (remote when authed + online, else local IndexedDB) and, on the local
// path, mirrors the write to IDB and enqueues a pending op for later sync.

import { useNetwork } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	CollectedItemRecord,
	CollectItemInput,
	GameCollectedItemsData,
} from "#/features/game/data/types.ts";
import { getOrCreateAnonUserId } from "#/features/sync/identity/anon-id.ts";
import { enqueueOp } from "#/features/sync/queue/pending-ops.ts";
import {
	collectItemServerFn,
	listCollectedItemsByUserIdServerFn,
	listCollectedItemsServerFn,
	uncollectItemServerFn,
} from "#/games/remnant2/data/server/collected-items.ts";
import { useSession } from "#/integrations/better-auth/auth-client.ts";
import { ensureIdbUserStub } from "#/integrations/prisma-idb/ensure-user-stub.ts";
import { getIDBClient } from "#/integrations/prisma-idb/idb-client.ts";

const ENTITY = "remnant2CollectedItem";

const toIso = (value: Date | string | null | undefined): string | undefined =>
	value instanceof Date ? value.toISOString() : (value ?? undefined);

const useList = () => {
	const { data: session } = useSession();
	const { online } = useNetwork();
	const authUserId = session?.user?.id ?? null;
	const userId = authUserId ?? getOrCreateAnonUserId();
	const remote = !!authUserId && online;

	return useQuery({
		queryKey: ["data", ENTITY, "list", userId],
		queryFn: async (): Promise<CollectedItemRecord[]> => {
			if (remote) return listCollectedItemsServerFn();
			if (!userId) return [];
			const idb = await getIDBClient();
			return idb.remnant2CollectedItem.findMany({ where: { userId } });
		},
	});
};

const usePublicList = (publicUserId: string | null) =>
	useQuery({
		queryKey: ["data", ENTITY, "list", "byUserId", publicUserId],
		queryFn: (): Promise<CollectedItemRecord[]> =>
			publicUserId
				? listCollectedItemsByUserIdServerFn({ data: { userId: publicUserId } })
				: Promise.resolve([]),
		enabled: !!publicUserId,
	});

const useCollect = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();
	const { online } = useNetwork();

	return useMutation<CollectedItemRecord, Error, CollectItemInput>({
		mutationFn: async (input) => {
			const authUserId = session?.user?.id ?? null;
			const anonUserId = getOrCreateAnonUserId();
			const userId = authUserId ?? anonUserId;
			if (authUserId && online) {
				return collectItemServerFn({ data: { itemId: input.itemId } });
			}
			const idb = await getIDBClient();
			await ensureIdbUserStub(idb, userId);
			const existing = await idb.remnant2CollectedItem.findFirst({
				where: { userId, itemId: input.itemId },
			});
			const [record] = await Promise.all([
				idb.remnant2CollectedItem.upsert({
					where: { userId_itemId: { userId, itemId: input.itemId } },
					update: {},
					create: { userId, itemId: input.itemId },
				}),
				enqueueOp({
					anonUserId,
					entity: ENTITY,
					operation: "upsert",
					payload: { itemId: input.itemId, itemName: input.itemName },
					idempotencyKey: `${ENTITY}:upsert:${anonUserId}:${input.itemId}`,
					serverUpdatedAt: toIso(existing?.updatedAt),
					summary: { title: `Collected: ${input.itemName}` },
				}),
			]);
			return record;
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["data", ENTITY] }),
	});
};

const useUncollect = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();
	const { online } = useNetwork();

	return useMutation<{ ok: true }, Error, CollectItemInput>({
		mutationFn: async (input) => {
			const authUserId = session?.user?.id ?? null;
			const anonUserId = getOrCreateAnonUserId();
			const userId = authUserId ?? anonUserId;
			if (authUserId && online) {
				return uncollectItemServerFn({ data: { itemId: input.itemId } });
			}
			const idb = await getIDBClient();
			const existing = await idb.remnant2CollectedItem.findFirst({
				where: { userId, itemId: input.itemId },
			});
			await Promise.all([
				idb.remnant2CollectedItem.deleteMany({
					where: { userId, itemId: input.itemId },
				}),
				enqueueOp({
					anonUserId,
					entity: ENTITY,
					operation: "delete",
					payload: { itemId: input.itemId, itemName: input.itemName },
					idempotencyKey: `${ENTITY}:delete:${anonUserId}:${input.itemId}`,
					serverUpdatedAt: toIso(existing?.updatedAt),
					summary: { title: `Uncollected: ${input.itemName}` },
				}),
			]);
			return { ok: true as const };
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["data", ENTITY] }),
	});
};

export const remnant2CollectedItemsData: GameCollectedItemsData = {
	useList,
	usePublicList,
	useCollect,
	useUncollect,
};
