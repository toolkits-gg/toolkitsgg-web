import type { GameConfig } from "#/features/game/types.ts";
import { ITEMS } from "#/games/clairobscur/core/game-config/items";
import { METADATA } from "#/games/clairobscur/core/game-config/metadata";
import { PAGES } from "#/games/clairobscur/core/game-config/pages";
import { THEME } from "#/games/clairobscur/core/game-config/theme";
import type { ClairObscurLocalItem } from "#/games/clairobscur/core/types.ts";
import { clairObscurCollectedItemsDal } from "#/games/clairobscur/dal/collected-items";
import type { ClairObscurItemCategory } from "@/prisma";

const GAME_CONFIG = {
	ITEMS,
	THEME,
	METADATA,
	PAGES,
	SEARCH_PARAMS: undefined, // TODO
	DAL: { collectedItems: clairObscurCollectedItemsDal },
} satisfies GameConfig<ClairObscurLocalItem, ClairObscurItemCategory>;

export { GAME_CONFIG };
