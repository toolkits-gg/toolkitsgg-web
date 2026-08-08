/**
 * Explicit games-registry of the claim that re-keys a game's local rows when an
 * anonymous visitor signs in.
 *
 * Separate from public-registry because it shares a bundling tier with the
 * local stores rather than with game metadata: everything reachable from here
 * is browser-only.
 */

import type { GameLocalClaim } from "#/features/game/types";
import { clairObscurLocalClaim } from "#/games/clairobscur/core/game-config/local-claim";
import { remnant2LocalClaim } from "#/games/remnant2/core/game-config/local-claim";
import { slayTheSpire2LocalClaim } from "#/games/slaythespire2/core/game-config/local-claim";
import type { GameId } from "@/prisma";

type RegisteredGameId = Exclude<GameId, "none">;

const allGameLocalClaims: Record<RegisteredGameId, GameLocalClaim> = {
	clairobscur: clairObscurLocalClaim,
	remnant2: remnant2LocalClaim,
	slaythespire2: slayTheSpire2LocalClaim,
};

export { allGameLocalClaims };
