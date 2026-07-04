import { useNetwork } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	CreatedBuildRecord,
	CreatedBuildSummary,
	DeleteBuildInput,
	GameCreatedBuildsData,
	UpdateBuildInput,
} from "#/features/game/data/types.ts";
import { extractBuildWriteFields } from "#/features/game/data/utils.ts";
import { getOrCreateAnonUserId } from "#/features/sync/local-data/identity/anon-id.ts";
import { enqueueOp } from "#/features/sync/local-data/queue/pending-ops.ts";
import {
	deleteBuildServerFn,
	getBuildByIdServerFn,
	listBuildsByUserIdServerFn,
	listBuildsServerFn,
	updateBuildServerFn,
} from "#/games/remnant2/data/created-builds/created-builds.ts";
import { useSession } from "#/integrations/better-auth/auth-client.ts";
import { getIDBClient } from "#/integrations/prisma-idb/idb-client.ts";

const ENTITY = "remnant2Build";

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
		queryFn: async (): Promise<CreatedBuildSummary[]> => {
			if (remote) return listBuildsServerFn();
			if (!userId) return [];
			const idb = await getIDBClient();
			return idb.remnant2Build.findMany({
				where: { createdById: userId },
				orderBy: { updatedAt: "desc" },
			});
		},
	});
};

const usePublicList = (publicUserId: string | null) =>
	useQuery({
		queryKey: ["data", ENTITY, "list", "byUserId", publicUserId],
		queryFn: (): Promise<CreatedBuildSummary[]> =>
			publicUserId
				? listBuildsByUserIdServerFn({ data: { userId: publicUserId } })
				: Promise.resolve([]),
		enabled: !!publicUserId,
	});

const useById = (buildId: string) => {
	const { data: session } = useSession();
	const { online } = useNetwork();
	const remote = !!session?.user?.id && online;

	return useQuery({
		queryKey: ["data", ENTITY, "byId", buildId],
		queryFn: async (): Promise<CreatedBuildRecord | null> => {
			if (remote) return getBuildByIdServerFn({ data: { buildId } });
			const idb = await getIDBClient();
			return idb.remnant2Build.findUnique({ where: { id: buildId } });
		},
	});
};

const useUpdate = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();
	const { online } = useNetwork();

	return useMutation<CreatedBuildRecord, Error, UpdateBuildInput>({
		mutationFn: async (input) => {
			const authUserId = session?.user?.id ?? null;
			const anonUserId = getOrCreateAnonUserId();
			if (authUserId && online) return updateBuildServerFn({ data: input });

			const idb = await getIDBClient();
			const existing = await idb.remnant2Build.findUnique({
				where: { id: input.buildId },
			});
			const [record] = await Promise.all([
				idb.remnant2Build.update({
					where: { id: input.buildId },
					// generated prisma-idb arg types don't accept the string visibility;
					// the runtime stores it verbatim. See features/game/data/build-fields.
					data: extractBuildWriteFields(input) as never,
				}),
				enqueueOp({
					anonUserId,
					entity: ENTITY,
					operation: "update",
					payload: input,
					// Unique per edit: a stable key would let enqueueOp drop a second edit
					// made before the first synced.
					idempotencyKey: `${ENTITY}:update:${anonUserId}:${input.buildId}:${crypto.randomUUID()}`,
					serverUpdatedAt: toIso(existing?.updatedAt),
					summary: {
						title: input.name
							? `Updated build: ${input.name}`
							: "Updated build",
						gameId: "remnant2",
					},
				}),
			]);
			return record;
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["data", ENTITY] }),
	});
};

const useRemove = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();
	const { online } = useNetwork();

	return useMutation<{ ok: true }, Error, DeleteBuildInput>({
		mutationFn: async (input) => {
			const authUserId = session?.user?.id ?? null;
			const anonUserId = getOrCreateAnonUserId();
			if (authUserId && online) return deleteBuildServerFn({ data: input });

			const idb = await getIDBClient();
			const existing = await idb.remnant2Build.findUnique({
				where: { id: input.buildId },
			});
			await Promise.all([
				idb.remnant2Build.deleteMany({ where: { id: input.buildId } }),
				enqueueOp({
					anonUserId,
					entity: ENTITY,
					operation: "delete",
					payload: input,
					idempotencyKey: `${ENTITY}:delete:${anonUserId}:${input.buildId}`,
					serverUpdatedAt: toIso(existing?.updatedAt),
					summary: { title: "Deleted build", gameId: "remnant2" },
				}),
			]);
			return { ok: true as const };
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["data", ENTITY] }),
	});
};

export const remnant2CreatedBuildsData: GameCreatedBuildsData = {
	useList,
	usePublicList,
	useById,
	useUpdate,
	useRemove,
};
