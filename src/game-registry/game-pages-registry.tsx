import type { GamePages } from "#/features/game/types.ts";
import { PAGES as CLAIROBSCUR_PAGES } from "#/games/clairobscur/core/game-config/pages.tsx";
import { PAGES as REMNANT2_PAGES } from "#/games/remnant2/core/game-config/pages.tsx";
import { PAGES as SLAYTHESPIRE2_PAGES } from "#/games/slaythespire2/core/game-config/pages.tsx";
import type { PublicRegistryGameId } from "#/registry/game-public-registry.tsx";

export const GAME_PAGES_REGISTRY = {
	clairobscur: CLAIROBSCUR_PAGES,
	remnant2: REMNANT2_PAGES,
	slaythespire2: SLAYTHESPIRE2_PAGES,
} satisfies Record<PublicRegistryGameId, GamePages>;

export type GamePagesRegistryGameIdKey = keyof typeof GAME_PAGES_REGISTRY;

export const getGamePages = (gameId: string): GamePages | undefined =>
	GAME_PAGES_REGISTRY[gameId as GamePagesRegistryGameIdKey];
