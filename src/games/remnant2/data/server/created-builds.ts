// Remnant 2 created builds: server functions (Postgres via Prisma) and the
// offline-sync handler. Build CRUD is written out here (and re-used by the sync
// handler below) rather than hidden behind a factory.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	type BuildWriteFields,
	extractBuildWriteFields,
} from "#/features/game/data/build-fields.ts";
import type {
	CreatedBuildRecord,
	CreatedBuildSummary,
} from "#/features/game/data/types.ts";
import type { HasUpdatedAt } from "#/features/sync/last-write-wins.ts";
import { createRecordSyncHandler } from "#/features/sync/record-sync-handler.ts";
import type { SyncHandler } from "#/features/sync/types.ts";

// Client-safe mirror of the Prisma `BuildVisibility` enum. This module is pulled
// into the client bundle via the route, so it must NOT reference `@/prisma` at
// module scope — only inside the dynamically-imported handler bodies below.
const BUILD_VISIBILITY_VALUES = ["PUBLIC", "UNLISTED", "PRIVATE"] as const;
type BuildVisibilityValue = (typeof BUILD_VISIBILITY_VALUES)[number];

const BuildByIdInput = z.object({ buildId: z.string().min(1) });
const ListByUserIdInput = z.object({ userId: z.string().min(1) });
const UpdateBuildInput = z.object({
	buildId: z.string().min(1),
	name: z.string().min(1).optional(),
	description: z.string().nullable().optional(),
	visibility: z.enum(BUILD_VISIBILITY_VALUES).optional(),
	videoUrl: z.string().nullable().optional(),
	imageUrl: z.string().nullable().optional(),
	thumbnailUrl: z.string().nullable().optional(),
	referenceUrl: z.string().nullable().optional(),
	gameVersion: z.string().nullable().optional(),
});

/** Server-side build-write fields — like BuildWriteFields but with the real enum. */
type BuildUpdateData = Omit<BuildWriteFields, "visibility"> & {
	visibility?: BuildVisibilityValue;
};

/** Updates a build the user owns. Throws if it doesn't exist or isn't theirs. */
const updateOwnedBuild = async (
	userId: string,
	buildId: string,
	fields: BuildWriteFields,
): Promise<CreatedBuildRecord> => {
	const { prisma } = await import("@/prisma");
	// updateMany lets us scope by createdById (ownership) in the where clause.
	const res = await prisma.remnant2Build.updateMany({
		where: { id: buildId, createdById: userId },
		data: fields as BuildUpdateData,
	});
	if (res.count === 0) throw new Error("Build not found or not owned by user");
	const updated = await prisma.remnant2Build.findUnique({
		where: { id: buildId },
	});
	if (!updated) throw new Error("Build not found after update");
	return updated;
};

const listBuildsServerFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<CreatedBuildSummary[]> => {
		const { prisma } = await import("@/prisma");
		const { requireUserId } = await import(
			"#/features/user/require-user.server.ts"
		);
		return prisma.remnant2Build.findMany({
			where: { createdById: await requireUserId() },
			orderBy: { updatedAt: "desc" },
		});
	},
);

const getBuildByIdServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => BuildByIdInput.parse(v))
	.handler(
		async ({ data }): Promise<CreatedBuildRecord | null> => {
			const { prisma } = await import("@/prisma");
			return prisma.remnant2Build.findUnique({ where: { id: data.buildId } });
		},
	);

const listBuildsByUserIdServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => ListByUserIdInput.parse(v))
	.handler(
		async ({ data }): Promise<CreatedBuildSummary[]> => {
			const { BuildVisibility, prisma } = await import("@/prisma");
			return prisma.remnant2Build.findMany({
				where: { createdById: data.userId, visibility: BuildVisibility.PUBLIC },
				orderBy: { updatedAt: "desc" },
			});
		},
	);

const updateBuildServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => UpdateBuildInput.parse(v))
	.handler(async ({ data }) => {
		const { requireUserId } = await import(
			"#/features/user/require-user.server.ts"
		);
		return updateOwnedBuild(
			await requireUserId(),
			data.buildId,
			extractBuildWriteFields(data),
		);
	});

const deleteBuildServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => BuildByIdInput.parse(v))
	.handler(async ({ data }) => {
		const { prisma } = await import("@/prisma");
		const { requireUserId } = await import(
			"#/features/user/require-user.server.ts"
		);
		const userId = await requireUserId();
		await prisma.remnant2Build.deleteMany({
			where: { id: data.buildId, createdById: userId },
		});
		return { ok: true as const };
	});

/** Offline-sync handler for the remnant2Build entity (mutable content record). */
const remnant2BuildHandler: SyncHandler = createRecordSyncHandler<string>({
	resolveKey: (op) => {
		const buildId = (op.payload as { buildId?: string } | null)?.buildId;
		return buildId
			? { ok: true, key: buildId }
			: { ok: false, message: "missing buildId" };
	},
	findRecord: async (_userId, buildId) => {
		const { prisma } = await import("@/prisma");
		return prisma.remnant2Build.findUnique({
			where: { id: buildId },
		}) as Promise<HasUpdatedAt | null>;
	},
	createRecord: async (userId, buildId, payload) => {
		const { prisma } = await import("@/prisma");
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
		const { prisma } = await import("@/prisma");
		await prisma.remnant2Build.deleteMany({
			where: { id: buildId, createdById: userId },
		});
	},
});

export {
	deleteBuildServerFn,
	getBuildByIdServerFn,
	listBuildsByUserIdServerFn,
	listBuildsServerFn,
	remnant2BuildHandler,
	updateBuildServerFn,
};
