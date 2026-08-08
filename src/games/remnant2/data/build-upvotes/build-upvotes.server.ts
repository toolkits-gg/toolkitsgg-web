import type { CreatedBuildSummary } from "#/features/game/data/types";
import { HIDDEN_MODERATOR_STATUSES } from "#/features/moderation/build-status.server";
import { requireUserId } from "#/features/user/require-user.server";
import { attachVariantSets } from "#/games/remnant2/data/build-collections/build-variant-sets.server";
import { enforceUserWriteLimit } from "#/integrations/rate-limit/enforce-user-write-limit";
import { BuildVisibility, prisma } from "@/prisma";

/**
 * Upvote rows are the source of truth for Remnant2Build.upvoteCount, so both
 * move together and the count only shifts when the row actually changes.
 */
const upvoteOwnedByUser = async (userId: string, buildId: string) => {
	const existing = await prisma.remnant2BuildUpvote.findUnique({
		where: { buildId_userId: { buildId, userId } },
	});
	if (existing) return { ok: true as const };

	await prisma.$transaction([
		prisma.remnant2BuildUpvote.create({ data: { buildId, userId } }),
		prisma.remnant2Build.update({
			where: { id: buildId },
			data: { upvoteCount: { increment: 1 } },
		}),
	]);
	return { ok: true as const };
};

const removeUpvoteOwnedByUser = async (userId: string, buildId: string) => {
	const existing = await prisma.remnant2BuildUpvote.findUnique({
		where: { buildId_userId: { buildId, userId } },
	});
	if (!existing) return { ok: true as const };

	await prisma.$transaction([
		prisma.remnant2BuildUpvote.delete({
			where: { buildId_userId: { buildId, userId } },
		}),
		prisma.remnant2Build.update({
			where: { id: buildId },
			data: { upvoteCount: { decrement: 1 } },
		}),
	]);
	return { ok: true as const };
};

const upvoteBuild = async (buildId: string) => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	return upvoteOwnedByUser(userId, buildId);
};

const removeBuildUpvote = async (buildId: string) => {
	const userId = await requireUserId();
	await enforceUserWriteLimit(userId);
	return removeUpvoteOwnedByUser(userId, buildId);
};

/** Builds a user has upvoted, filtered to what the viewer is allowed to see. */
const listUpvotedBuilds = async (
	userId: string,
	viewerId: string | null,
): Promise<CreatedBuildSummary[]> => {
	const rows = await prisma.remnant2BuildUpvote.findMany({
		where: {
			userId,
			Build:
				viewerId === userId
					? undefined
					: {
							visibility: BuildVisibility.PUBLIC,
							moderatorStatus: { notIn: HIDDEN_MODERATOR_STATUSES },
						},
		},
		orderBy: { createdAt: "desc" },
		include: { Build: true },
	});
	return attachVariantSets(
		rows.map((row) => row.Build),
		viewerId,
	);
};

const hasUpvotedBuild = async (buildId: string): Promise<boolean> => {
	const userId = await requireUserId();
	const row = await prisma.remnant2BuildUpvote.findUnique({
		where: { buildId_userId: { buildId, userId } },
	});
	return !!row;
};

export {
	hasUpvotedBuild,
	listUpvotedBuilds,
	removeBuildUpvote,
	removeUpvoteOwnedByUser,
	upvoteBuild,
	upvoteOwnedByUser,
};
