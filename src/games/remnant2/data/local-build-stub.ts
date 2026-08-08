import type { CreatedBuildSummary } from "#/features/game/data/types";
import { toImageFit } from "#/features/image-position/image-fit";
import { remnant2BuildStore } from "#/features/local-db/game-stores";

/**
 * Mirrors a build the viewer does not own into IDB, so an anonymous visitor's
 * upvote of a server-side build has something local to read back: the
 * "builds I upvoted" list is assembled from these rows until the queue drains.
 *
 * `upvoteCount` is whatever the server said when the page rendered, so the local
 * copy is a snapshot; the server recomputes the real count when the op replays.
 * `updatedAt` is carried over rather than stamped, so the row keeps the server's
 * own timestamp for the last-write-wins comparison.
 */
const ensureLocalBuildStub = async (
	build: CreatedBuildSummary,
): Promise<void> => {
	const existing = await remnant2BuildStore.findUnique({
		where: { id: build.id },
	});
	if (existing) return;

	await remnant2BuildStore.create({
		data: {
			id: build.id,
			createdById: build.createdById,
			name: build.name,
			visibility: build.visibility,
			imageUrl: build.imageUrl ?? null,
			imagePositionX: build.imagePositionX ?? undefined,
			imagePositionY: build.imagePositionY ?? undefined,
			imageFit: toImageFit(build.imageFit),
			thumbnailUrl: build.thumbnailUrl ?? null,
			upvoteCount: build.upvoteCount ?? undefined,
			updatedAt: build.updatedAt ? new Date(build.updatedAt) : undefined,
		},
	});
};

export { ensureLocalBuildStub };
