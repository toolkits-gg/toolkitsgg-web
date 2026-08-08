import { createPresenceToggleSyncHandler } from "#/features/sync/presence-sync-handler";
import { createRecordSyncHandler } from "#/features/sync/record-sync-handler";
import type { HasUpdatedAt, SyncHandler } from "#/features/sync/types";
import {
	addBuildToOwnedCollection,
	removeBuildFromOwnedCollection,
	setOwnedCollectionBuildOrder,
} from "#/games/remnant2/data/build-collections/build-collection-members.server";
import {
	createOwnedCollection,
	deleteOwnedCollection,
	updateOwnedCollection,
} from "#/games/remnant2/data/build-collections/build-collections.server";
import { prisma } from "@/prisma";

type CollectionPayload = {
	name?: string;
	description?: string | null;
	visibility?: "PUBLIC" | "UNLISTED" | "PRIVATE";
	displayMode?: "CARDS" | "VARIANTS";
};

const extractCollectionFields = (payload: unknown): CollectionPayload => {
	const input = (payload ?? {}) as Record<string, unknown>;
	const out: CollectionPayload = {};
	if (typeof input.name === "string") out.name = input.name;
	if (input.description !== undefined)
		out.description = input.description as string | null;
	if (input.visibility !== undefined)
		out.visibility = input.visibility as CollectionPayload["visibility"];
	if (input.displayMode !== undefined)
		out.displayMode = input.displayMode as CollectionPayload["displayMode"];
	return out;
};

/**
 * Reorders ride the collection entity rather than the membership one: they are
 * keyed on the collection, and they bump its `updatedAt`, so they share the
 * record handler's last-write-wins baseline instead of needing a second one.
 */
const extractBuildOrder = (payload: unknown): string[] | null => {
	const buildIds = (payload as { buildIds?: unknown } | null)?.buildIds;
	if (!Array.isArray(buildIds)) return null;
	return buildIds.filter((id): id is string => typeof id === "string");
};

const remnant2BuildCollectionSyncHandler: SyncHandler =
	createRecordSyncHandler<string>({
		resolveKey: (op) => {
			const collectionId = (op.payload as { collectionId?: string } | null)
				?.collectionId;
			return collectionId
				? { ok: true, key: collectionId }
				: { ok: false, message: "missing collectionId" };
		},
		findRecord: (_userId, collectionId) =>
			prisma.remnant2BuildCollection.findUnique({
				where: { id: collectionId },
			}) as Promise<HasUpdatedAt | null>,
		createRecord: async (userId, collectionId, payload) => {
			const fields = extractCollectionFields(payload);
			await createOwnedCollection(userId, collectionId, {
				...fields,
				name: fields.name ?? "Untitled collection",
			});
		},
		updateRecord: async (userId, collectionId, payload) => {
			const buildIds = extractBuildOrder(payload);
			if (buildIds) {
				await setOwnedCollectionBuildOrder(userId, collectionId, buildIds);
				return;
			}
			await updateOwnedCollection(
				userId,
				collectionId,
				extractCollectionFields(payload),
			);
		},
		deleteRecord: async (userId, collectionId) => {
			await deleteOwnedCollection(userId, collectionId);
		},
	});

type MembershipKey = { collectionId: string; buildId: string };

const remnant2BuildOnCollectionSyncHandler: SyncHandler =
	createPresenceToggleSyncHandler<MembershipKey>({
		resolveKey: (op) => {
			const payload = op.payload as Partial<MembershipKey> | null;
			return payload?.collectionId && payload?.buildId
				? {
						ok: true,
						key: {
							collectionId: payload.collectionId,
							buildId: payload.buildId,
						},
					}
				: { ok: false, message: "missing collectionId or buildId" };
		},
		findRecord: (_userId, key) =>
			prisma.remnant2BuildsOnCollections.findUnique({
				where: {
					collectionId_buildId: {
						collectionId: key.collectionId,
						buildId: key.buildId,
					},
				},
			}) as Promise<HasUpdatedAt | null>,
		createRecord: async (userId, key) => {
			await addBuildToOwnedCollection(userId, key.collectionId, key.buildId);
		},
		deleteRecord: async (userId, key) => {
			await removeBuildFromOwnedCollection(
				userId,
				key.collectionId,
				key.buildId,
			);
		},
	});

export {
	remnant2BuildCollectionSyncHandler,
	remnant2BuildOnCollectionSyncHandler,
};
