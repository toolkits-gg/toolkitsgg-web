import type { GameLocalClaim } from "#/features/game/types";
import { claimLocalRows } from "#/features/local-db/claim-rows";
import {
	remnant2BuildCollectionStore,
	remnant2BuildStore,
	remnant2BuildUpvoteStore,
	remnant2CollectedItemStore,
} from "#/features/local-db/game-stores";

const remnant2LocalClaim: GameLocalClaim = {
	claimLocalRows: async (fromUserId, toUserId) => {
		await claimLocalRows(
			remnant2BuildStore,
			"createdById",
			fromUserId,
			toUserId,
		);
		await claimLocalRows(
			remnant2BuildCollectionStore,
			"createdById",
			fromUserId,
			toUserId,
		);
		await claimLocalRows(
			remnant2BuildUpvoteStore,
			"userId",
			fromUserId,
			toUserId,
		);
		await claimLocalRows(
			remnant2CollectedItemStore,
			"userId",
			fromUserId,
			toUserId,
		);
	},
};

export { remnant2LocalClaim };
