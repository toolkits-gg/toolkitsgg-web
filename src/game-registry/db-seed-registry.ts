import type { GameDBSeed } from "#/features/game/types.ts";
import { clairObscurDBSeed } from "#/games/clairobscur/core/game-config/db-seed.ts";
import { remnant2DBSeed } from "#/games/remnant2/core/game-config/db-seed.ts";
import { slayTheSpire2DBSeed } from "#/games/slaythespire2/core/game-config/db-seed.ts";
import type { GameId } from "@/prisma";

const allGameDBSeeds: Record<Exclude<GameId, "none">, GameDBSeed> = {
	clairobscur: clairObscurDBSeed,
	remnant2: remnant2DBSeed,
	slaythespire2: slayTheSpire2DBSeed,
};

export { allGameDBSeeds };
