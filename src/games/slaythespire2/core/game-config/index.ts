import type { PublicGameConfig } from "#/features/game/types";
import { AVATARS } from "#/games/slaythespire2/core/game-config/avatars";
import { ITEMS } from "#/games/slaythespire2/core/game-config/items";
import { METADATA } from "#/games/slaythespire2/core/game-config/metadata";
import { SEARCH_PARAMS } from "#/games/slaythespire2/core/game-config/nuqs-parsers";
import { THEME } from "#/games/slaythespire2/core/game-config/theme";
import { INLINE_ITEM_TAGS } from "#/games/slaythespire2/core/item-data/tags/inline-item-tags";
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
	INLINE_TAGS: INLINE_ITEM_TAGS,
	// DATA: { collectedItems: slayTheSpire2CollectedItemsData },
};
