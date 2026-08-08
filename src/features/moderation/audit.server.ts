import type { PrismaTx } from "#/features/moderation/review-items.server";
import type {
	GameId,
	ModerationActionType,
	ModerationTargetType,
} from "@/prisma";

type LogModerationArgs = {
	tx: PrismaTx;
	actorId: string;
	gameId: GameId;
	action: ModerationActionType;
	targetType: ModerationTargetType;
	targetId: string;
	previousValue?: string | null;
	newValue?: string | null;
	reason?: string | null;
};

/**
 * Appends to the audit log. Always called inside the same transaction as the
 * action it records, so a privileged write cannot land unlogged - which matters
 * most for DELETE, where the target row is gone afterwards and this is the only
 * remaining trace.
 */
const logModerationAction = async ({
	tx,
	actorId,
	gameId,
	action,
	targetType,
	targetId,
	previousValue,
	newValue,
	reason,
}: LogModerationArgs): Promise<void> => {
	await tx.moderationAction.create({
		data: {
			actorId,
			gameId,
			action,
			targetType,
			targetId,
			previousValue: previousValue ?? null,
			newValue: newValue ?? null,
			reason: reason ?? null,
		},
	});
};

/**
 * Whether a moderator has deleted this target. The audit log doubles as the
 * tombstone: its rows deliberately outlive the content they describe, so it is
 * the only record that a build which no longer exists was taken down rather
 * than never created.
 *
 * Needed because a local queue can hold writes for a build deleted while the
 * client was away, and a create replayed against a missing row would otherwise
 * reinstate it.
 */
const wasModeratorDeleted = async (
	client: PrismaTx,
	targetType: ModerationTargetType,
	targetId: string,
): Promise<boolean> => {
	const deletion = await client.moderationAction.findFirst({
		where: { targetType, targetId, action: "DELETE" },
		select: { id: true },
	});
	return deletion !== null;
};

export { logModerationAction, wasModeratorDeleted };
