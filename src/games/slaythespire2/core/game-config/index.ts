import type { GameConfig } from "#/features/game/types.ts";
import { AVATARS } from "#/games/slaythespire2/core/game-config/avatars";
import { ITEMS } from "#/games/slaythespire2/core/game-config/items";
import { METADATA } from "#/games/slaythespire2/core/game-config/metadata";
import { SEARCH_PARAMS } from "#/games/slaythespire2/core/game-config/nuqs-parsers.ts";
import { PAGES } from "#/games/slaythespire2/core/game-config/pages";
import { THEME } from "#/games/slaythespire2/core/game-config/theme";
import type { SlayTheSpire2LocalItem } from "#/games/slaythespire2/core/types";
import { slayTheSpire2CollectedItemsData } from "#/games/slaythespire2/data/collected-items";
import type { SlayTheSpire2ItemCategory } from "@/prisma";

const GAME_CONFIG = {
	ITEMS,
	THEME,
	METADATA,
	PAGES,
	SEARCH_PARAMS,
	AVATARS,
	data: { collectedItems: slayTheSpire2CollectedItemsData },
} satisfies GameConfig<SlayTheSpire2LocalItem, SlayTheSpire2ItemCategory>;

export { GAME_CONFIG };
