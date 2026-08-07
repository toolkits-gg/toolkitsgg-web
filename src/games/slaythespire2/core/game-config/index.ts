import type { PublicGameConfig } from "#/features/game/types.ts";
import { AVATARS } from "#/games/slaythespire2/core/game-config/avatars";
import { ITEMS } from "#/games/slaythespire2/core/game-config/items";
import { METADATA } from "#/games/slaythespire2/core/game-config/metadata";
import { SEARCH_PARAMS } from "#/games/slaythespire2/core/game-config/nuqs-parsers.ts";
import { THEME } from "#/games/slaythespire2/core/game-config/theme";
import type { SlayTheSpire2LocalItem } from "#/games/slaythespire2/core/types";
import type { SlayTheSpire2ItemCategory } from "@/prisma";

export const PUBLIC_GAME_CONFIG: PublicGameConfig<
	SlayTheSpire2LocalItem,
	SlayTheSpire2ItemCategory
> = {
	ITEMS,
	THEME,
	METADATA,
	SEARCH_PARAMS,
	AVATARS,
	// DATA: { collectedItems: slayTheSpire2CollectedItemsData },
};
