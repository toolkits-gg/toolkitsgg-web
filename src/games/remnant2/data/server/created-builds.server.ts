// Remnant 2 created builds: server-only data access (Postgres via Prisma). Build
// CRUD is written out here rather than hidden behind a factory; the ownership-
// scoped `updateOwnedBuild` write is shared with the offline-sync handler, which
// lives alongside in created-builds.sync.server.ts. The `.server.ts` suffix opts
// this into Start's import protection, keeping prisma out of the client bundle.
// Consumed by the created-builds server-fn wrappers (inside their handlers).

import type { BuildWriteFields } from "#/features/game/data/build-fields.ts";
import type {
	CreatedBuildRecord,
	CreatedBuildSummary,
} from "#/features/game/data/types.ts";
import { requireUserId } from "#/features/user/require-user.server.ts";
import { BuildVisibility, prisma } from "@/prisma";

/** Server-side build-write fields — like BuildWriteFields but with the real enum. */
type BuildUpdateData = Omit<BuildWriteFields, "visibility"> & {
	visibility?: BuildVisibility;
};

/** Updates a build the user owns. Throws if it doesn't exist or isn't theirs. */
const updateOwnedBuild = async (
	userId: string,
	buildId: string,
	fields: BuildWriteFields,
): Promise<CreatedBuildRecord> => {
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

const listBuilds = async (): Promise<CreatedBuildSummary[]> => {
	const userId = await requireUserId();
	return prisma.remnant2Build.findMany({
		where: { createdById: userId },
		orderBy: { updatedAt: "desc" },
	});
};

const getBuildById = (buildId: string): Promise<CreatedBuildRecord | null> =>
	prisma.remnant2Build.findUnique({ where: { id: buildId } });

const listBuildsByUserId = (userId: string): Promise<CreatedBuildSummary[]> =>
	prisma.remnant2Build.findMany({
		where: { createdById: userId, visibility: BuildVisibility.PUBLIC },
		orderBy: { updatedAt: "desc" },
	});

const updateBuild = async (
	buildId: string,
	fields: BuildWriteFields,
): Promise<CreatedBuildRecord> =>
	updateOwnedBuild(await requireUserId(), buildId, fields);

const deleteBuild = async (buildId: string) => {
	const userId = await requireUserId();
	await prisma.remnant2Build.deleteMany({
		where: { id: buildId, createdById: userId },
	});
	return { ok: true as const };
};

export {
	type BuildUpdateData,
	deleteBuild,
	getBuildById,
	listBuilds,
	listBuildsByUserId,
	updateBuild,
	updateOwnedBuild,
};
