import type { PublicGameConfig } from "#/features/game/types.ts";
import { ITEMS } from "#/games/clairobscur/core/game-config/items";
import { METADATA } from "#/games/clairobscur/core/game-config/metadata";
import { THEME } from "#/games/clairobscur/core/game-config/theme";
import type { ClairObscurLocalItem } from "#/games/clairobscur/core/types.ts";
import type { ClairObscurItemCategory } from "@/prisma";

export const PUBLIC_GAME_CONFIG: PublicGameConfig<
	ClairObscurLocalItem,
	ClairObscurItemCategory
> = {
	ITEMS,
	THEME,
	METADATA,
	SEARCH_PARAMS: undefined, // TODO
	// data: { collectedItems: clairObscurCollectedItemsData },
};
