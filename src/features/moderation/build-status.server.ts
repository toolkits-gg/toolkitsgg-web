import { BuildModeratorStatus } from "@/prisma";

/**
 * The statuses a moderator has actively hidden something with.
 *
 * Moderation is reactive, so PENDING is the normal healthy state for content
 * nobody has looked at yet, not a purgatory: listings filter these two out
 * rather than requiring APPROVED.
 */
const HIDDEN_MODERATOR_STATUSES: BuildModeratorStatus[] = [
	BuildModeratorStatus.REJECTED,
	BuildModeratorStatus.LOCKED,
];

export { HIDDEN_MODERATOR_STATUSES };
