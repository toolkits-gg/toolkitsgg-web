import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type {
	BuildCollectionRecord,
	BuildCollectionSummary,
} from "#/features/game/data/types";
import { MAX_DESCRIPTION_LENGTH } from "#/features/markdown/constants";
import { getOptionalUserId } from "#/features/user/require-user.server";
import {
	addBuildToCollection,
	listCollectionIdsForBuild,
	removeBuildFromCollection,
	setCollectionBuildOrder,
} from "#/games/remnant2/data/build-collections/build-collection-members.server";
import {
	createCollection,
	deleteCollection,
	getCollectionById,
	listCollections,
	listCollectionsByUserId,
	updateCollection,
} from "#/games/remnant2/data/build-collections/build-collections.server";

// Client-safe mirrors of the Prisma enums, so this validation module never
// references `@/prisma` at module scope.
const BUILD_VISIBILITY_VALUES = ["PUBLIC", "UNLISTED", "PRIVATE"] as const;
const BUILD_COLLECTION_DISPLAY_MODE_VALUES = ["CARDS", "VARIANTS"] as const;

const MAX_ORDERED_BUILDS = 200;

const CollectionByIdInput = z.object({ collectionId: z.string().min(1) });
const ListByUserIdInput = z.object({ userId: z.string().min(1) });
const CreateCollectionInput = z.object({
	collectionId: z.string().min(1),
	name: z.string().min(1),
	description: z.string().max(MAX_DESCRIPTION_LENGTH).nullable().optional(),
	visibility: z.enum(BUILD_VISIBILITY_VALUES).optional(),
	displayMode: z.enum(BUILD_COLLECTION_DISPLAY_MODE_VALUES).optional(),
});
const UpdateCollectionInput = z.object({
	collectionId: z.string().min(1),
	name: z.string().min(1).optional(),
	description: z.string().max(MAX_DESCRIPTION_LENGTH).nullable().optional(),
	visibility: z.enum(BUILD_VISIBILITY_VALUES).optional(),
	displayMode: z.enum(BUILD_COLLECTION_DISPLAY_MODE_VALUES).optional(),
});
const MembershipInput = z.object({
	collectionId: z.string().min(1),
	buildId: z.string().min(1),
});
const BuildOrderInput = z.object({
	collectionId: z.string().min(1),
	buildIds: z.array(z.string().min(1)).max(MAX_ORDERED_BUILDS),
});
const BuildByIdInput = z.object({ buildId: z.string().min(1) });

const listCollectionsServerFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<BuildCollectionSummary[]> => listCollections(),
);

const listCollectionsByUserIdServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => ListByUserIdInput.parse(v))
	.handler(
		async ({ data }): Promise<BuildCollectionSummary[]> =>
			listCollectionsByUserId(data.userId),
	);

const getCollectionByIdServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => CollectionByIdInput.parse(v))
	.handler(async ({ data }): Promise<BuildCollectionRecord | null> => {
		const viewerId = await getOptionalUserId();
		return getCollectionById(data.collectionId, viewerId);
	});

const createCollectionServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => CreateCollectionInput.parse(v))
	.handler(async ({ data }) => createCollection(data));

const updateCollectionServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => UpdateCollectionInput.parse(v))
	.handler(async ({ data }) => updateCollection(data));

const deleteCollectionServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => CollectionByIdInput.parse(v))
	.handler(async ({ data }) => deleteCollection(data.collectionId));

const addBuildToCollectionServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => MembershipInput.parse(v))
	.handler(async ({ data }) =>
		addBuildToCollection(data.collectionId, data.buildId),
	);

const removeBuildFromCollectionServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => MembershipInput.parse(v))
	.handler(async ({ data }) =>
		removeBuildFromCollection(data.collectionId, data.buildId),
	);

const setCollectionBuildOrderServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => BuildOrderInput.parse(v))
	.handler(async ({ data }) =>
		setCollectionBuildOrder(data.collectionId, data.buildIds),
	);

const listCollectionIdsForBuildServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => BuildByIdInput.parse(v))
	.handler(
		async ({ data }): Promise<string[]> =>
			listCollectionIdsForBuild(data.buildId),
	);

export {
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
};
