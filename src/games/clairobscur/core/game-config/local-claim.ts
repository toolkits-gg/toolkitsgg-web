import type { GameLocalClaim } from "#/features/game/types";
import { claimLocalRows } from "#/features/local-db/claim-rows";
import { clairObscurCollectedItemStore } from "#/features/local-db/game-stores";

const clairObscurLocalClaim: GameLocalClaim = {
	claimLocalRows: (fromUserId, toUserId) =>
		claimLocalRows(
			clairObscurCollectedItemStore,
			"userId",
			fromUserId,
			toUserId,
		),
};

export { clairObscurLocalClaim };
