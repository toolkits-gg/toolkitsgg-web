// Remnant 2 created builds: client data hooks. Each hook inlines the backend
// choice (remote when signed in, else local IndexedDB) and, on the local
// path, mirrors the write to IDB and enqueues a pending op for later sync.

import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	BuildRelationFields,
	BuildVariantSetRef,
	BuildViewInput,
	CreateBuildInput,
	CreatedBuildRecord,
	CreatedBuildSummary,
	DeleteBuildInput,
	DuplicateBuildInput,
	GameCreatedBuildsData,
	UpdateBuildInput,
} from "#/features/game/data/types";
import {
	extractBuildRelations,
	extractBuildWriteFields,
	toIso,
} from "#/features/game/data/utils";
import { toImageFit } from "#/features/image-position/image-fit";
import {
	remnant2BuildCollectionStore,
	remnant2BuildItemStore,
	remnant2BuildStore,
	remnant2BuildsOnCollectionsStore,
	remnant2BuildTagStore,
} from "#/features/local-db/game-stores";
import { getOrCreateAnonUserId } from "#/features/sync/identity/anon-id";
import { enqueueOp } from "#/features/sync/queue/pending-ops";
import {
	createBuildServerFn,
	deleteBuildServerFn,
	duplicateBuildServerFn,
	getBuildByIdServerFn,
	listBuildsByUserIdServerFn,
	listBuildsServerFn,
	recordBuildViewServerFn,
	updateBuildServerFn,
} from "#/games/remnant2/data/created-builds/created-builds";
import { useSession } from "#/integrations/better-auth/auth-client";

const ENTITY = "remnant2Build";
const DUPLICATE_ENTITY = "remnant2BuildDuplicate";

/** Mirrors the loadout and tag join rows into IDB, matching replaceBuildRelations. */
const writeLocalBuildRelations = async (
	buildId: string,
	relations: BuildRelationFields,
): Promise<void> => {
	if (relations.loadout !== undefined) {
		await remnant2BuildItemStore.deleteMany({ where: { buildId } });
		for (const entry of relations.loadout) {
			await remnant2BuildItemStore.create({
				data: {
					buildId,
					itemId: entry.itemId,
					level: entry.level,
					amount: entry.amount,
					optional: entry.optional,
				},
			});
		}
		await remnant2BuildStore.update({
			where: { id: buildId },
			data: { itemCount: relations.loadout.length },
		});
	}

	if (relations.tags !== undefined) {
		await remnant2BuildTagStore.deleteMany({ where: { buildId } });
		for (const tag of relations.tags) {
			await remnant2BuildTagStore.create({ data: { buildId, tag } });
		}
	}
};

/** Matches the server's cascade: nothing else clears a deleted build's join rows. */
const deleteLocalBuild = async (buildId: string): Promise<void> => {
	await remnant2BuildItemStore.deleteMany({ where: { buildId } });
	await remnant2BuildTagStore.deleteMany({ where: { buildId } });
	await remnant2BuildsOnCollectionsStore.deleteMany({ where: { buildId } });
	await remnant2BuildStore.deleteMany({ where: { id: buildId } });
};

/**
 * Rebuilds the ref the server attaches with `attachVariantSets`, so a build sitting
 * in a device-local variant set reads the same as a synced one. The visibility rule
 * the server applies has nothing to filter here: IndexedDB only ever holds the
 * acting user's own collections.
 *
 * The claim column is the authority on membership, matching the server; the join
 * rows are read only for the count and for which member sits at position 0.
 */
const readLocalVariantSet = async (
	buildId: string,
	collectionId: string | null | undefined,
): Promise<BuildVariantSetRef | null> => {
	if (!collectionId) return null;
	const collection = await remnant2BuildCollectionStore.findUnique({
		where: { id: collectionId },
	});
	if (collection?.displayMode !== "VARIANTS") return null;

	const members = await remnant2BuildsOnCollectionsStore.findMany({
		where: { collectionId },
		orderBy: { position: "asc" },
	});
	const primary = members[0];

	return {
		collectionId,
		name: collection.name,
		variantCount: members.length,
		isPrimary: primary?.buildId === buildId,
	};
};

/** Hydrates a locally-stored build into the app-level record shape. */
const readLocalBuildRecord = async (
	buildId: string,
): Promise<CreatedBuildRecord | null> => {
	const build = await remnant2BuildStore.findUnique({ where: { id: buildId } });
	if (!build) return null;
	const [items, tags, variantSet] = await Promise.all([
		remnant2BuildItemStore.findMany({ where: { buildId } }),
		remnant2BuildTagStore.findMany({ where: { buildId } }),
		readLocalVariantSet(buildId, build.variantCollectionId),
	]);
	return {
		...build,
		loadout: items.map((item) => ({
			itemId: item.itemId,
			level: item.level,
			amount: item.amount,
			optional: item.optional,
		})),
		tags: tags.map((row) => row.tag),
		variantSet,
	};
};

const useList = () => {
	const { data: session } = useSession();
	const authUserId = session?.user?.id ?? null;
	const userId = authUserId ?? getOrCreateAnonUserId();
	const remote = !!authUserId;

	return useQuery({
		queryKey: ["data", ENTITY, "list", userId],
		queryFn: async (): Promise<CreatedBuildSummary[]> => {
			if (remote) return listBuildsServerFn();
			if (!userId) return [];
			return remnant2BuildStore.findMany({
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

const useById = (buildId: string) =>
	useQuery({
		queryKey: ["data", ENTITY, "byId", buildId],
		queryFn: async (): Promise<CreatedBuildRecord | null> => {
			// Unlike the list reads, this one isn't gated on being signed in: a
			// shared build link has to resolve for logged-out visitors too, and the
			// server fn applies visibility itself. The local fallback then covers
			// builds an anonymous user created on this device, so a failed request
			// falls through to it rather than erroring the query.
			const remote = await getBuildByIdServerFn({ data: { buildId } }).catch(
				() => null,
			);
			return remote ?? (await readLocalBuildRecord(buildId));
		},
		enabled: !!buildId,
	});

const useCreate = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();

	return useMutation<CreatedBuildRecord, Error, CreateBuildInput>({
		mutationFn: async (input) => {
			const authUserId = session?.user?.id ?? null;
			const anonUserId = getOrCreateAnonUserId();
			if (authUserId) return createBuildServerFn({ data: input });

			await remnant2BuildStore.create({
				data: {
					...extractBuildWriteFields(input),
					id: input.buildId,
					createdById: anonUserId,
					name: input.name,
				},
			});
			await writeLocalBuildRelations(
				input.buildId,
				extractBuildRelations(input),
			);
			await enqueueOp({
				anonUserId,
				entity: ENTITY,
				operation: "create",
				payload: input,
				// Stable: the build id is minted client-side, so a replayed create
				// lands on the same row rather than making a duplicate.
				idempotencyKey: `${ENTITY}:create:${anonUserId}:${input.buildId}`,
				summary: {
					title: `Created build: ${input.name}`,
					gameId: "remnant2",
				},
			});
			const record = await readLocalBuildRecord(input.buildId);
			if (!record) throw new Error("Build not found after local create");
			return record;
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["data", ENTITY] }),
		onError: (error) =>
			notifications.show({
				title: "Couldn't create build",
				message: error.message,
				color: "red",
			}),
	});
};

/**
 * Copies a build into a variant set.
 *
 * The local path mirrors both rows into IDB so the copy shows up immediately,
 * but queues a single `remnant2BuildDuplicate` op rather than a build create
 * plus a membership add. The server replays that op as one transaction, so a
 * partially drained queue can never leave the copy outside its set.
 */
const useDuplicate = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();

	return useMutation<CreatedBuildRecord, Error, DuplicateBuildInput>({
		mutationFn: async (input) => {
			const authUserId = session?.user?.id ?? null;
			const anonUserId = getOrCreateAnonUserId();
			if (authUserId) return duplicateBuildServerFn({ data: input });

			const source = await readLocalBuildRecord(input.sourceBuildId);
			if (!source) throw new Error("Build not found");

			const name = `${source.name} (copy)`;
			const createInput: CreateBuildInput = {
				buildId: input.newBuildId,
				name,
				description: source.description,
				visibility: source.visibility,
				videoUrl: source.videoUrl,
				imageUrl: source.imageUrl,
				imagePositionX: source.imagePositionX ?? undefined,
				imagePositionY: source.imagePositionY ?? undefined,
				imageFit: toImageFit(source.imageFit),
				referenceUrl: source.referenceUrl,
				gameVersion: source.gameVersion,
				loadout: source.loadout,
				tags: source.tags,
			};

			const collection = await remnant2BuildCollectionStore.findUnique({
				where: { id: input.collectionId },
			});
			await remnant2BuildStore.create({
				data: {
					...extractBuildWriteFields(createInput),
					id: input.newBuildId,
					createdById: anonUserId,
					name,
					variantCollectionId:
						collection?.displayMode === "VARIANTS" ? input.collectionId : null,
				},
			});
			await writeLocalBuildRelations(
				input.newBuildId,
				extractBuildRelations(createInput),
			);

			const members = await remnant2BuildsOnCollectionsStore.findMany({
				where: { collectionId: input.collectionId },
			});
			await remnant2BuildsOnCollectionsStore.create({
				data: {
					collectionId: input.collectionId,
					buildId: input.newBuildId,
					position: members.length,
				},
			});

			await enqueueOp({
				anonUserId,
				entity: DUPLICATE_ENTITY,
				operation: "create",
				payload: input,
				// Stable: the copy's id is minted client-side and the server call is
				// replay-safe, so a redelivered op lands on the row it already made.
				idempotencyKey: `${DUPLICATE_ENTITY}:${anonUserId}:${input.newBuildId}`,
				summary: { title: `Added variant: ${name}`, gameId: "remnant2" },
			});

			const record = await readLocalBuildRecord(input.newBuildId);
			if (!record) throw new Error("Build not found after local duplicate");
			return record;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["data", ENTITY] });
			queryClient.invalidateQueries({
				queryKey: ["data", "remnant2BuildCollection"],
			});
		},
		onError: (error) =>
			notifications.show({
				title: "Couldn't add variant",
				message: error.message,
				color: "red",
			}),
	});
};

const useUpdate = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();

	return useMutation<CreatedBuildRecord, Error, UpdateBuildInput>({
		mutationFn: async (input) => {
			const authUserId = session?.user?.id ?? null;
			const anonUserId = getOrCreateAnonUserId();
			if (authUserId) return updateBuildServerFn({ data: input });

			const existing = await remnant2BuildStore.findUnique({
				where: { id: input.buildId },
			});
			await remnant2BuildStore.update({
				where: { id: input.buildId },
				data: extractBuildWriteFields(input),
			});
			await writeLocalBuildRelations(
				input.buildId,
				extractBuildRelations(input),
			);
			await enqueueOp({
				anonUserId,
				entity: ENTITY,
				operation: "update",
				payload: input,
				// Unique per edit: a stable key would let enqueueOp drop a second edit
				// made before the first synced.
				idempotencyKey: `${ENTITY}:update:${anonUserId}:${input.buildId}:${crypto.randomUUID()}`,
				serverUpdatedAt: toIso(existing?.updatedAt),
				summary: {
					title: input.name ? `Updated build: ${input.name}` : "Updated build",
					gameId: "remnant2",
				},
			});
			const record = await readLocalBuildRecord(input.buildId);
			if (!record) throw new Error("Build not found after local update");
			return record;
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["data", ENTITY] }),
		onError: (error) =>
			notifications.show({
				title: "Couldn't save build",
				message: error.message,
				color: "red",
			}),
	});
};

const useRemove = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();

	return useMutation<{ ok: true }, Error, DeleteBuildInput>({
		mutationFn: async (input) => {
			const authUserId = session?.user?.id ?? null;
			const anonUserId = getOrCreateAnonUserId();
			if (authUserId) return deleteBuildServerFn({ data: input });

			const existing = await remnant2BuildStore.findUnique({
				where: { id: input.buildId },
			});
			await Promise.all([
				deleteLocalBuild(input.buildId),
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
		onError: (error) =>
			notifications.show({
				title: "Couldn't delete build",
				message: error.message,
				color: "red",
			}),
	});
};

/**
 * Records a build view. Remote-only and deliberately silent: view counts aren't
 * worth a queued op or an error toast, so a failed request is simply not counted.
 */
const useRecordView = () => {
	const { data: session } = useSession();

	return useMutation<{ ok: true }, Error, BuildViewInput>({
		mutationFn: async (input) =>
			recordBuildViewServerFn({
				data: {
					buildId: input.buildId,
					viewerKey: session?.user?.id ?? input.viewerKey,
				},
			}).catch(() => ({ ok: true as const })),
	});
};

const remnant2CreatedBuildsData: GameCreatedBuildsData = {
	useList,
	usePublicList,
	useById,
	useCreate,
	useUpdate,
	useRemove,
	useDuplicate,
	useRecordView,
};

export { remnant2CreatedBuildsData };
