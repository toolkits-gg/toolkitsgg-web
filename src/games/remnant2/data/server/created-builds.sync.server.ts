import { extractBuildWriteFields } from "#/features/game/data/utils.ts";
import { createRecordSyncHandler } from "#/features/sync/local-data/record-sync-handler.ts";
import type {
	HasUpdatedAt,
	SyncHandler,
} from "#/features/sync/local-data/types.ts";
import {
	type BuildUpdateData,
	updateOwnedBuild,
} from "#/games/remnant2/data/server/created-builds.server.ts";
import { prisma } from "@/prisma";

const remnant2BuildHandler: SyncHandler = createRecordSyncHandler<string>({
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
	createRecord: async (userId, buildId, payload) => {
		// Only reached if the server row is gone — resurrect the user's own build.
		const fields = extractBuildWriteFields(payload as Record<string, unknown>);
		await prisma.remnant2Build.create({
			data: {
				...(fields as BuildUpdateData),
				id: buildId,
				createdById: userId,
				name: fields.name ?? "Untitled build",
			},
		});
	},
	updateRecord: async (userId, buildId, payload) => {
		await updateOwnedBuild(
			userId,
			buildId,
			extractBuildWriteFields(payload as Record<string, unknown>),
		);
	},
	deleteRecord: async (userId, buildId) => {
		await prisma.remnant2Build.deleteMany({
			where: { id: buildId, createdById: userId },
		});
	},
});

export { remnant2BuildHandler };
