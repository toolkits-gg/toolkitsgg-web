import type { CreateBuildInput } from "#/features/game/data/types";
import {
	extractBuildRelations,
	extractBuildWriteFields,
} from "#/features/game/data/utils";
import { wasModeratorDeleted } from "#/features/moderation/audit.server";
import { createRecordSyncHandler } from "#/features/sync/record-sync-handler";
import type { HasUpdatedAt, SyncHandler } from "#/features/sync/types";
import {
	createOwnedBuild,
	duplicateOwnedBuild,
	updateOwnedBuild,
} from "#/games/remnant2/data/created-builds/created-builds.server";
import { prisma } from "@/prisma";

type DuplicatePayload = {
	sourceBuildId?: string;
	newBuildId?: string;
	collectionId?: string;
};

const remnant2BuildSyncHandler: SyncHandler = createRecordSyncHandler<string>({
	resolveKey: (op) => {
		const buildId = (op.payload as { buildId?: string } | null)?.buildId;
		return buildId
			? { ok: true, key: buildId }
			: { ok: false, message: "missing buildId" };
	},
	findRecord: (_userId, buildId) =>
		prisma.remnant2Build.findUnique({
			where: { id: buildId },
		}) as Promise<HasUpdatedAt | null>,
	isTombstoned: (buildId) => wasModeratorDeleted(prisma, "BUILD", buildId),
	createRecord: async (userId, buildId, payload) => {
		const input = payload as Record<string, unknown>;
		const fields = extractBuildWriteFields(input);
		await createOwnedBuild(
			userId,
			{
				buildId,
				name: fields.name ?? "Untitled build",
			} as CreateBuildInput,
			fields,
			extractBuildRelations(input),
		);
	},
	updateRecord: async (userId, buildId, payload) => {
		const input = payload as Record<string, unknown>;
		await updateOwnedBuild(
			userId,
			buildId,
			extractBuildWriteFields(input),
			extractBuildRelations(input),
		);
	},
	deleteRecord: async (userId, buildId) => {
		await prisma.remnant2Build.deleteMany({
			where: { id: buildId, createdById: userId },
		});
	},
});

/**
 * A queued duplicate replays as one op rather than a build create followed by a
 * collection add, so a partially drained queue can never leave the copy sitting
 * outside the set it was made for.
 *
 * Hand-written rather than built on createRecordSyncHandler: a duplicate carries
 * no mutable state to reconcile, so there is nothing for last-write-wins to
 * compare. The copy's client-minted id already existing means the op succeeded,
 * which is a noop - running it through LWW would report that as a conflict and
 * ask the user to resolve a write that had in fact landed.
 */
const remnant2BuildDuplicateSyncHandler: SyncHandler = async (op, userId) => {
	const payload = (op.payload ?? {}) as DuplicatePayload;
	const { sourceBuildId, newBuildId, collectionId } = payload;
	if (!sourceBuildId || !newBuildId || !collectionId)
		return {
			status: "error",
			message: "missing sourceBuildId, newBuildId or collectionId",
		};

	const existing = await prisma.remnant2Build.findUnique({
		where: { id: newBuildId },
		select: { id: true },
	});
	if (existing) return { status: "noop" };

	try {
		await duplicateOwnedBuild(userId, sourceBuildId, newBuildId, collectionId);
		return { status: "applied" };
	} catch (cause) {
		return {
			status: "error",
			message: cause instanceof Error ? cause.message : "duplicate failed",
		};
	}
};

export { remnant2BuildDuplicateSyncHandler, remnant2BuildSyncHandler };
