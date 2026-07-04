import type {
	BuildWriteFields,
	CreatedBuildRecord,
	CreatedBuildSummary,
} from "#/features/game/data/types.ts";
import { requireUserId } from "#/features/user/require-user.server.ts";
import { enforceUserWriteLimit } from "#/integrations/rate-limiter-flexible/enforce-user-write-limit.ts";
import { BuildVisibility, prisma } from "@/prisma";

export type BuildUpdateData = Omit<BuildWriteFields, "visibility"> & {
	visibility?: BuildVisibility;
};
export const updateOwnedBuild = async (
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

export const listBuilds = async (): Promise<CreatedBuildSummary[]> => {
	const userId = await requireUserId();
	return prisma.remnant2Build.findMany({
		where: { createdById: userId },
		orderBy: { updatedAt: "desc" },
	});
};

export const getBuildById = (
	buildId: string,
): Promise<CreatedBuildRecord | null> =>
	prisma.remnant2Build.findUnique({ where: { id: buildId } });

export const listBuildsByUserId = (
	userId: string,
): Promise<CreatedBuildSummary[]> =>
	prisma.remnant2Build.findMany({
		where: { createdById: userId, visibility: BuildVisibility.PUBLIC },
		orderBy: { updatedAt: "desc" },
	});

export const updateBuild = async (
	buildId: string,
	fields: BuildWriteFields,
): Promise<CreatedBuildRecord> => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	return updateOwnedBuild(userId, buildId, fields);
};

export const deleteBuild = async (buildId: string) => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	await prisma.remnant2Build.deleteMany({
		where: { id: buildId, createdById: userId },
	});
	return { ok: true as const };
};
