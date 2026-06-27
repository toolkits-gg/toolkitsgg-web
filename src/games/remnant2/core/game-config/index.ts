import type { GameConfig } from "#/features/game/types.ts";
import { AVATARS } from "#/games/remnant2/core/game-config/avatars";
import { ITEMS } from "#/games/remnant2/core/game-config/items";
import { METADATA } from "#/games/remnant2/core/game-config/metadata";
import { SEARCH_PARAMS } from "#/games/remnant2/core/game-config/nuqs-parsers.ts";
import { PAGES } from "#/games/remnant2/core/game-config/pages";
import { THEME } from "#/games/remnant2/core/game-config/theme";
import type { Remnant2LocalItem } from "#/games/remnant2/core/types";
import { remnant2CollectedItemsData } from "#/games/remnant2/data/collected-items";
import { remnant2CreatedBuildsData } from "#/games/remnant2/data/created-builds";
import type { Remnant2ItemCategory } from "@/prisma";

const GAME_CONFIG = {
	ITEMS,
	THEME,
	METADATA,
	PAGES,
	SEARCH_PARAMS,
	AVATARS,
	data: {
		collectedItems: remnant2CollectedItemsData,
		createdBuilds: remnant2CreatedBuildsData,
	},
} satisfies GameConfig<Remnant2LocalItem, Remnant2ItemCategory>;

export { GAME_CONFIG };
