import type { GameConfig } from "#/features/game/core/types";
import { AVATARS } from "#/games/remnant2/core/game-config/avatars";
import { ITEMS } from "#/games/remnant2/core/game-config/items";
import { METADATA } from "#/games/remnant2/core/game-config/metadata";
import { PAGES } from "#/games/remnant2/core/game-config/pages";
import { SEARCH_PARAMS } from "#/games/remnant2/core/game-config/search-params";
import { THEME } from "#/games/remnant2/core/game-config/theme";
import type { Remnant2LocalItem } from "#/games/remnant2/core/types";
import { remnant2CollectedItemsDal } from "#/games/remnant2/dal/collected-items";
import type { Remnant2ItemCategory } from "@/prisma";

const GAME_CONFIG = {
	ITEMS,
	THEME,
	METADATA,
	PAGES,
	SEARCH_PARAMS,
	AVATARS,
	DAL: { collectedItems: remnant2CollectedItemsDal },
} satisfies GameConfig<Remnant2LocalItem, Remnant2ItemCategory>;

export { GAME_CONFIG };
