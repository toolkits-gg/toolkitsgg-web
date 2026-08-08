import type { GameLocalClaim } from "#/features/game/types";
import { claimLocalRows } from "#/features/local-db/claim-rows";
import { slayTheSpire2CollectedItemStore } from "#/features/local-db/game-stores";

const slayTheSpire2LocalClaim: GameLocalClaim = {
	claimLocalRows: (fromUserId, toUserId) =>
		claimLocalRows(
			slayTheSpire2CollectedItemStore,
			"userId",
			fromUserId,
			toUserId,
		),
};

export { slayTheSpire2LocalClaim };
