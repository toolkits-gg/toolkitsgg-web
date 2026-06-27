// Prisma-free definition of a build's user-editable fields. Shared by the client
// DAL (local IDB write), the server functions, and the sync handler so all three
// write exactly the same set of fields. Must NOT import `@/prisma` — it is pulled
// into the client bundle via the DAL.

/** The mutable fields a user can edit on a build (visibility kept as a string here). */
type BuildWriteFields = {
	name?: string;
	description?: string | null;
	visibility?: string;
	videoUrl?: string | null;
	imageUrl?: string | null;
	thumbnailUrl?: string | null;
	referenceUrl?: string | null;
	gameVersion?: string | null;
};

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
const extractBuildWriteFields = (
	input: Record<string, unknown>,
): BuildWriteFields => {
	const out: Record<string, unknown> = {};
	for (const key of BUILD_WRITE_KEYS) {
		if (input[key] !== undefined) out[key] = input[key];
	}
	return out as BuildWriteFields;
};

export type { BuildWriteFields };
export { BUILD_WRITE_KEYS, extractBuildWriteFields };
