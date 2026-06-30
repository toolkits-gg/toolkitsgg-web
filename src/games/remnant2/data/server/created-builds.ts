// Remnant 2 created builds: input validation and the TanStack server-fn wrappers.
// Each wrapper delegates to ./created-builds.server.ts; those imports are
// referenced only inside handler bodies, so the compiler strips them (and prisma)
// from the client bundle.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { extractBuildWriteFields } from "#/features/game/data/build-fields.ts";
import type {
	CreatedBuildRecord,
	CreatedBuildSummary,
} from "#/features/game/data/types.ts";
import {
	deleteBuild,
	getBuildById,
	listBuilds,
	listBuildsByUserId,
	updateBuild,
} from "#/games/remnant2/data/server/created-builds.server.ts";

// Client-safe mirror of the Prisma `BuildVisibility` enum, so this validation
// module never references `@/prisma` at module scope.
const BUILD_VISIBILITY_VALUES = ["PUBLIC", "UNLISTED", "PRIVATE"] as const;

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

const listBuildsServerFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<CreatedBuildSummary[]> => listBuilds(),
);

const getBuildByIdServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => BuildByIdInput.parse(v))
	.handler(
		async ({ data }): Promise<CreatedBuildRecord | null> =>
			getBuildById(data.buildId),
	);

const listBuildsByUserIdServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => ListByUserIdInput.parse(v))
	.handler(
		async ({ data }): Promise<CreatedBuildSummary[]> =>
			listBuildsByUserId(data.userId),
	);

const updateBuildServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => UpdateBuildInput.parse(v))
	.handler(async ({ data }) =>
		updateBuild(data.buildId, extractBuildWriteFields(data)),
	);

const deleteBuildServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => BuildByIdInput.parse(v))
	.handler(async ({ data }) => deleteBuild(data.buildId));

export {
	deleteBuildServerFn,
	getBuildByIdServerFn,
	listBuildsByUserIdServerFn,
	listBuildsServerFn,
	updateBuildServerFn,
};
