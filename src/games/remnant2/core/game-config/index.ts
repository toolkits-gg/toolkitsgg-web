import type { PublicGameConfig } from "#/features/game/types.ts";
import { AVATARS } from "#/games/remnant2/core/game-config/avatars";
import { ITEMS } from "#/games/remnant2/core/game-config/items";
import { METADATA } from "#/games/remnant2/core/game-config/metadata";
import { SEARCH_PARAMS } from "#/games/remnant2/core/game-config/nuqs-parsers.ts";
import { THEME } from "#/games/remnant2/core/game-config/theme";
import type { Remnant2LocalItem } from "#/games/remnant2/core/types";
import type { Remnant2ItemCategory } from "@/prisma";

export const PUBLIC_GAME_CONFIG: PublicGameConfig<
	Remnant2LocalItem,
	Remnant2ItemCategory
> = {
	ITEMS,
	THEME,
	METADATA,
	SEARCH_PARAMS,
	AVATARS,
};
