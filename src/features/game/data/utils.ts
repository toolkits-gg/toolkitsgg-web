import type { BuildWriteFields } from "#/features/game/data/types.ts";

const BUILD_WRITE_KEYS = [
	"name",
	"description",
	"visibility",
	"videoUrl",
	"imageUrl",
	"thumbnailUrl",
	"referenceUrl",
	"gameVersion",
] as const;

/** Picks only the defined build-write fields from an input object (drops `buildId`, undefined). */
export const extractBuildWriteFields = (
	input: Record<string, unknown>,
): BuildWriteFields => {
	const out: Record<string, unknown> = {};
	for (const key of BUILD_WRITE_KEYS) {
		if (input[key] !== undefined) out[key] = input[key];
	}
	return out as BuildWriteFields;
};
