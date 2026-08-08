// Remnant 2 build collections: client data hooks. Each hook inlines the backend
// choice (remote when signed in, else local IndexedDB) and, on the local
// path, mirrors the write to IDB and enqueues a pending op for later sync.

import { notifications } from "@mantine/notifications";
import {
	type QueryClient,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import type {
	BuildCollectionRecord,
	BuildCollectionSummary,
	CollectionMembershipInput,
	CreateBuildCollectionInput,
	CreatedBuildSummary,
	DeleteBuildCollectionInput,
	GameBuildCollectionsData,
	SetCollectionBuildOrderInput,
	UpdateBuildCollectionInput,
} from "#/features/game/data/types";
import { resolveBuildOrder, toIso } from "#/features/game/data/utils";
import {
	remnant2BuildCollectionStore,
	remnant2BuildStore,
	remnant2BuildsOnCollectionsStore,
} from "#/features/local-db/game-stores";
import { getOrCreateAnonUserId } from "#/features/sync/identity/anon-id";
import { enqueueOp } from "#/features/sync/queue/pending-ops";
import {
	addBuildToCollectionServerFn,
	createCollectionServerFn,
	deleteCollectionServerFn,
	getCollectionByIdServerFn,
	listCollectionIdsForBuildServerFn,
	listCollectionsByUserIdServerFn,
	listCollectionsServerFn,
	removeBuildFromCollectionServerFn,
	setCollectionBuildOrderServerFn,
	updateCollectionServerFn,
} from "#/games/remnant2/data/build-collections/build-collections";
import { ensureLocalBuildStub } from "#/games/remnant2/data/local-build-stub";
import { useSession } from "#/integrations/better-auth/auth-client";

const ENTITY = "remnant2BuildCollection";
const MEMBER_ENTITY = "remnant2BuildOnCollection";
const BUILD_ENTITY = "remnant2Build";

/**
 * Renames and reorders both change the variant-set ref the server embeds in every
 * member build (`name`, `isPrimary`), and that ref drives the build page's
 * redirect and the name a build card shows. Invalidating only the collection
 * would leave those reading the previous set.
 */
const invalidateCollectionsAndBuilds = (queryClient: QueryClient) => {
	queryClient.invalidateQueries({ queryKey: ["data", ENTITY] });
	queryClient.invalidateQueries({ queryKey: ["data", BUILD_ENTITY] });
};

type LocalCollectionRow = Omit<BuildCollectionSummary, "buildCount">;

/** Local reads have no `_count`, so buildCount is derived from the join store. */
const toLocalSummary = async (
	collection: LocalCollectionRow,
): Promise<BuildCollectionSummary> => {
	const members = await remnant2BuildsOnCollectionsStore.findMany({
		where: { collectionId: collection.id },
	});
	return { ...collection, buildCount: members.length };
};

const useList = () => {
	const { data: session } = useSession();
	const authUserId = session?.user?.id ?? null;
	const userId = authUserId ?? getOrCreateAnonUserId();
	const remote = !!authUserId;

	return useQuery({
		queryKey: ["data", ENTITY, "list", userId],
		queryFn: async (): Promise<BuildCollectionSummary[]> => {
			if (remote) return listCollectionsServerFn();
			if (!userId) return [];
			const rows = await remnant2BuildCollectionStore.findMany({
				where: { createdById: userId },
				orderBy: { updatedAt: "desc" },
			});
			return Promise.all(rows.map((row) => toLocalSummary(row)));
		},
	});
};

const usePublicList = (publicUserId: string | null) =>
	useQuery({
		queryKey: ["data", ENTITY, "list", "byUserId", publicUserId],
		queryFn: (): Promise<BuildCollectionSummary[]> =>
			publicUserId
				? listCollectionsByUserIdServerFn({ data: { userId: publicUserId } })
				: Promise.resolve([]),
		enabled: !!publicUserId,
	});

const useById = (collectionId: string) =>
	useQuery({
		queryKey: ["data", ENTITY, "byId", collectionId],
		queryFn: async (): Promise<BuildCollectionRecord | null> => {
			// Not gated on being signed in: a shared collection link has to resolve
			// for logged-out visitors too, and the server fn applies visibility
			// itself. The local fallback covers anonymous, device-local collections,
			// so a failed request falls through to it rather than erroring the query.
			const remote = await getCollectionByIdServerFn({
				data: { collectionId },
			}).catch(() => null);
			if (remote) return remote;
			const collection = await remnant2BuildCollectionStore.findUnique({
				where: { id: collectionId },
			});
			if (!collection) return null;
			const members = await remnant2BuildsOnCollectionsStore.findMany({
				where: { collectionId },
				orderBy: { position: "asc" },
			});
			const rows = await Promise.all(
				members.map((member) =>
					remnant2BuildStore.findUnique({ where: { id: member.buildId } }),
				),
			);
			const builds: CreatedBuildSummary[] = rows.filter(
				(build) => build !== null,
			);
			return { ...(await toLocalSummary(collection)), builds };
		},
		enabled: !!collectionId,
	});

const useCollectionIdsForBuild = (buildId: string) => {
	const { data: session } = useSession();
	const authUserId = session?.user?.id ?? null;
	const userId = authUserId ?? getOrCreateAnonUserId();
	const remote = !!authUserId;

	return useQuery({
		queryKey: ["data", ENTITY, "forBuild", buildId, userId],
		queryFn: async (): Promise<string[]> => {
			if (remote)
				return listCollectionIdsForBuildServerFn({ data: { buildId } });
			const owned = await remnant2BuildCollectionStore.findMany({
				where: { createdById: userId },
			});
			const ownedIds = new Set(owned.map((row) => row.id));
			const members = await remnant2BuildsOnCollectionsStore.findMany({
				where: { buildId },
			});
			return members
				.map((member) => member.collectionId)
				.filter((id) => ownedIds.has(id));
		},
		enabled: !!buildId,
	});
};

const useCreate = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();

	return useMutation<BuildCollectionSummary, Error, CreateBuildCollectionInput>(
		{
			mutationFn: async (input) => {
				const authUserId = session?.user?.id ?? null;
				const anonUserId = getOrCreateAnonUserId();
				if (authUserId) return createCollectionServerFn({ data: input });

				const created = await remnant2BuildCollectionStore.create({
					data: {
						id: input.collectionId,
						createdById: anonUserId,
						name: input.name,
						description: input.description,
						visibility: input.visibility,
						displayMode: input.displayMode,
					},
				});
				await enqueueOp({
					anonUserId,
					entity: ENTITY,
					operation: "create",
					payload: input,
					// Stable: the collection id is minted client-side, so a replayed
					// create lands on the same row rather than making a duplicate.
					idempotencyKey: `${ENTITY}:create:${anonUserId}:${input.collectionId}`,
					summary: {
						title: `Created collection: ${input.name}`,
						gameId: "remnant2",
					},
				});
				return toLocalSummary(created);
			},
			onSuccess: () =>
				queryClient.invalidateQueries({ queryKey: ["data", ENTITY] }),
			onError: (error) =>
				notifications.show({
					title: "Couldn't create collection",
					message: error.message,
					color: "red",
				}),
		},
	);
};

const useUpdate = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();

	return useMutation<BuildCollectionSummary, Error, UpdateBuildCollectionInput>(
		{
			mutationFn: async (input) => {
				const authUserId = session?.user?.id ?? null;
				const anonUserId = getOrCreateAnonUserId();
				if (authUserId) return updateCollectionServerFn({ data: input });

				const existing = await remnant2BuildCollectionStore.findUnique({
					where: { id: input.collectionId },
				});
				const { collectionId, ...fields } = input;
				const updated = await remnant2BuildCollectionStore.update({
					where: { id: collectionId },
					data: fields,
				});

				// Mirror the server's flip handling: becoming a variant set claims every
				// member, dropping to cards releases them.
				if (fields.displayMode !== undefined) {
					const members = await remnant2BuildsOnCollectionsStore.findMany({
						where: { collectionId },
					});
					for (const member of members) {
						await remnant2BuildStore.update({
							where: { id: member.buildId },
							data: {
								variantCollectionId:
									fields.displayMode === "VARIANTS" ? collectionId : null,
							},
						});
					}
				}
				await enqueueOp({
					anonUserId,
					entity: ENTITY,
					operation: "update",
					payload: input,
					// Unique per edit: a stable key would let enqueueOp drop a second edit
					// made before the first synced.
					idempotencyKey: `${ENTITY}:update:${anonUserId}:${collectionId}:${crypto.randomUUID()}`,
					serverUpdatedAt: toIso(existing?.updatedAt),
					summary: {
						title: input.name
							? `Updated collection: ${input.name}`
							: "Updated collection",
						gameId: "remnant2",
					},
				});
				return toLocalSummary(updated);
			},
			onSuccess: () => invalidateCollectionsAndBuilds(queryClient),
			onError: (error) =>
				notifications.show({
					title: "Couldn't save collection",
					message: error.message,
					color: "red",
				}),
		},
	);
};

const useRemove = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();

	return useMutation<{ ok: true }, Error, DeleteBuildCollectionInput>({
		mutationFn: async (input) => {
			const authUserId = session?.user?.id ?? null;
			const anonUserId = getOrCreateAnonUserId();
			if (authUserId) return deleteCollectionServerFn({ data: input });

			const existing = await remnant2BuildCollectionStore.findUnique({
				where: { id: input.collectionId },
			});
			// Mirrors the server: dropping a set releases its members rather than
			// deleting them.
			await remnant2BuildStore.updateMany({
				where: { variantCollectionId: input.collectionId },
				data: { variantCollectionId: null },
			});
			await remnant2BuildsOnCollectionsStore.deleteMany({
				where: { collectionId: input.collectionId },
			});
			await remnant2BuildCollectionStore.deleteMany({
				where: { id: input.collectionId },
			});
			await enqueueOp({
				anonUserId,
				entity: ENTITY,
				operation: "delete",
				payload: input,
				idempotencyKey: `${ENTITY}:delete:${anonUserId}:${input.collectionId}`,
				serverUpdatedAt: toIso(existing?.updatedAt),
				summary: { title: "Deleted collection", gameId: "remnant2" },
			});
			return { ok: true as const };
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["data", ENTITY] }),
		onError: (error) =>
			notifications.show({
				title: "Couldn't delete collection",
				message: error.message,
				color: "red",
			}),
	});
};

const useMembershipMutation = (mode: "add" | "remove") => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();

	return useMutation<{ ok: true }, Error, CollectionMembershipInput>({
		mutationFn: async (input) => {
			const authUserId = session?.user?.id ?? null;
			const anonUserId = getOrCreateAnonUserId();
			const wire = {
				collectionId: input.collectionId,
				buildId: input.buildId,
			};
			if (authUserId) {
				return mode === "add"
					? addBuildToCollectionServerFn({ data: wire })
					: removeBuildFromCollectionServerFn({ data: wire });
			}

			await ensureLocalBuildStub(input.build);
			const existing = await remnant2BuildsOnCollectionsStore.findUnique({
				where: wire,
			});

			// The claim column mirrors what the server write does, so a local read
			// resolves the same variant set the queue will settle on.
			const collection = await remnant2BuildCollectionStore.findUnique({
				where: { id: input.collectionId },
			});
			const isVariantSet = collection?.displayMode === "VARIANTS";

			if (mode === "add") {
				if (!existing) {
					const members = await remnant2BuildsOnCollectionsStore.findMany({
						where: { collectionId: input.collectionId },
					});
					await remnant2BuildsOnCollectionsStore.create({
						data: { ...wire, position: members.length },
					});
				}
				if (isVariantSet)
					await remnant2BuildStore.update({
						where: { id: input.buildId },
						data: { variantCollectionId: input.collectionId },
					});
			} else {
				await remnant2BuildsOnCollectionsStore.deleteMany({ where: wire });
				if (isVariantSet)
					await remnant2BuildStore.update({
						where: { id: input.buildId },
						data: { variantCollectionId: null },
					});
			}

			await enqueueOp({
				anonUserId,
				entity: MEMBER_ENTITY,
				operation: mode === "add" ? "upsert" : "delete",
				payload: wire,
				// Stable: membership is presence-only, so replaying is idempotent.
				idempotencyKey: `${MEMBER_ENTITY}:${mode}:${anonUserId}:${input.collectionId}:${input.buildId}`,
				serverUpdatedAt: toIso(existing?.updatedAt),
				summary: {
					title:
						mode === "add"
							? "Added build to collection"
							: "Removed build from collection",
					gameId: "remnant2",
				},
			});
			return { ok: true as const };
		},
		onSuccess: () => invalidateCollectionsAndBuilds(queryClient),
		onError: (error) =>
			notifications.show({
				title:
					mode === "add"
						? "Couldn't add to collection"
						: "Couldn't remove from collection",
				message: error.message,
				color: "red",
			}),
	});
};

const useAddBuild = () => useMembershipMutation("add");
const useRemoveBuild = () => useMembershipMutation("remove");

const useSetBuildOrder = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();

	return useMutation<{ ok: true }, Error, SetCollectionBuildOrderInput>({
		mutationFn: async (input) => {
			const authUserId = session?.user?.id ?? null;
			const anonUserId = getOrCreateAnonUserId();
			if (authUserId) return setCollectionBuildOrderServerFn({ data: input });

			const existing = await remnant2BuildCollectionStore.findUnique({
				where: { id: input.collectionId },
			});
			const members = await remnant2BuildsOnCollectionsStore.findMany({
				where: { collectionId: input.collectionId },
				orderBy: { position: "asc" },
			});
			const ordered = resolveBuildOrder(
				members.map((member) => member.buildId),
				input.buildIds,
			);
			for (const [position, buildId] of ordered.entries()) {
				await remnant2BuildsOnCollectionsStore.update({
					where: { collectionId: input.collectionId, buildId },
					data: { position },
				});
			}

			await enqueueOp({
				anonUserId,
				entity: ENTITY,
				operation: "update",
				payload: input,
				// Unique per reorder, for the same reason the update path is: a stable
				// key would let enqueueOp drop a second drag made before the first synced.
				idempotencyKey: `${ENTITY}:order:${anonUserId}:${input.collectionId}:${crypto.randomUUID()}`,
				serverUpdatedAt: toIso(existing?.updatedAt),
				summary: { title: "Reordered collection", gameId: "remnant2" },
			});
			return { ok: true as const };
		},
		onSuccess: () => invalidateCollectionsAndBuilds(queryClient),
		onError: (error) =>
			notifications.show({
				title: "Couldn't reorder variants",
				message: error.message,
				color: "red",
			}),
	});
};

const remnant2BuildCollectionsData: GameBuildCollectionsData = {
	useList,
	usePublicList,
	useById,
	useCreate,
	useUpdate,
	useRemove,
	useAddBuild,
	useRemoveBuild,
	useSetBuildOrder,
	useCollectionIdsForBuild,
};

export { remnant2BuildCollectionsData };
