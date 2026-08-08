import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isAllowedBuildImageUrl } from "#/features/build-image/build-image-url";
import type {
	CreatedBuildRecord,
	CreatedBuildSummary,
} from "#/features/game/data/types";
import {
	extractBuildRelations,
	extractBuildWriteFields,
} from "#/features/game/data/utils";
import { IMAGE_FIT_VALUES } from "#/features/image-position/image-fit";
import { MAX_DESCRIPTION_LENGTH } from "#/features/markdown/constants";
import { getOptionalUserId } from "#/features/user/require-user.server";
import { REMNANT2_BUILD_TAG_VALUES } from "#/games/remnant2/core/build-tags";
import { BUILD_VISIBILITY_VALUES } from "#/games/remnant2/core/game-config/build-visibility-values";
import {
	createBuild,
	deleteBuild,
	duplicateBuild,
	getBuildById,
	listBuilds,
	listBuildsByUserId,
	recordBuildView,
	updateBuild,
} from "#/games/remnant2/data/created-builds/created-builds.server";

const LoadoutEntry = z.object({
	itemId: z.string().min(1),
	level: z.number().int().min(0).optional(),
	amount: z.number().int().nullable().optional(),
	optional: z.boolean().optional(),
});

const BuildScalarFields = {
	description: z.string().max(MAX_DESCRIPTION_LENGTH).nullable().optional(),
	visibility: z.enum(BUILD_VISIBILITY_VALUES).optional(),
	videoUrl: z.string().nullable().optional(),
	// Constrained rather than free text: build images skip moderation review, so
	// the curated-source guarantee has to hold at the write boundary.
	imageUrl: z
		.string()
		.refine(isAllowedBuildImageUrl, {
			// Naming the value is what makes a rejection diagnosable: the two legal
			// shapes are generated, so a rejection means one of the generators and
			// this guard disagree, and the string is the only thing that says which.
			error: (issue) => `Unrecognized build image: ${String(issue.input)}`,
		})
		.nullable()
		.optional(),
	imagePositionX: z.number().min(0).max(1).optional(),
	imagePositionY: z.number().min(0).max(1).optional(),
	imageFit: z.enum(IMAGE_FIT_VALUES).optional(),
	thumbnailUrl: z.string().nullable().optional(),
	referenceUrl: z.string().nullable().optional(),
	gameVersion: z.string().nullable().optional(),
	loadout: z.array(LoadoutEntry).optional(),
	// `Remnant2BuildTag.tag` is a String column, so this is what keeps tag values
	// legal. See the note in core/build-tags.ts.
	tags: z.array(z.enum(REMNANT2_BUILD_TAG_VALUES)).optional(),
};

const BuildByIdInput = z.object({ buildId: z.string().min(1) });
const ListByUserIdInput = z.object({ userId: z.string().min(1) });
const CreateBuildInput = z.object({
	buildId: z.string().min(1),
	name: z.string().min(1),
	...BuildScalarFields,
});
const UpdateBuildInput = z.object({
	buildId: z.string().min(1),
	name: z.string().min(1).optional(),
	...BuildScalarFields,
});
const RecordViewInput = z.object({
	buildId: z.string().min(1),
	viewerKey: z.string().min(1),
});
const DuplicateBuildInput = z.object({
	sourceBuildId: z.string().min(1),
	newBuildId: z.string().min(1),
	collectionId: z.string().min(1),
});

const listBuildsServerFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<CreatedBuildSummary[]> => listBuilds(),
);

const getBuildByIdServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => BuildByIdInput.parse(v))
	.handler(async ({ data }): Promise<CreatedBuildRecord | null> => {
		const viewerId = await getOptionalUserId();
		return getBuildById(data.buildId, viewerId);
	});

const listBuildsByUserIdServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => ListByUserIdInput.parse(v))
	.handler(async ({ data }): Promise<CreatedBuildSummary[]> => {
		const viewerId = await getOptionalUserId();
		return listBuildsByUserId(data.userId, viewerId);
	});

const createBuildServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => CreateBuildInput.parse(v))
	.handler(async ({ data }) =>
		createBuild(
			data,
			extractBuildWriteFields(data),
			extractBuildRelations(data),
		),
	);

const updateBuildServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => UpdateBuildInput.parse(v))
	.handler(async ({ data }) =>
		updateBuild(
			data.buildId,
			extractBuildWriteFields(data),
			extractBuildRelations(data),
		),
	);

const deleteBuildServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => BuildByIdInput.parse(v))
	.handler(async ({ data }) => deleteBuild(data.buildId));

const duplicateBuildServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => DuplicateBuildInput.parse(v))
	.handler(
		async ({ data }): Promise<CreatedBuildRecord> =>
			duplicateBuild(data.sourceBuildId, data.newBuildId, data.collectionId),
	);

const recordBuildViewServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => RecordViewInput.parse(v))
	.handler(async ({ data }) => recordBuildView(data.buildId, data.viewerKey));

export {
	createBuildServerFn,
	deleteBuildServerFn,
	duplicateBuildServerFn,
	getBuildByIdServerFn,
	listBuildsByUserIdServerFn,
	listBuildsServerFn,
	recordBuildViewServerFn,
	updateBuildServerFn,
};
