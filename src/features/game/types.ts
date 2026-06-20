import type { createSearchParamsCache } from "nuqs/server";
import type { ComponentType, ReactNode } from "react";
import type { LogoSize } from "#/components/AppLogo.tsx";
import type {
	AppItem,
	CollectedItemsViewMode,
	GameCollectedItemsDal,
} from "#/features/game/items/types.ts";
import type { ToolkitThemeDefinition } from "#/features/theme/types.ts";
import type { GameId } from "@/prisma";

type GameAvatar = {
	id: string;
	name: string;
	imageUrl: string;
	category?: string;
};

type GameIDBSeed = {
	/** localStorage flag key to prevent re-seeding, e.g. 'idb-seeded-remnant2' */
	seedFlag: string;
	/** Seeds game-specific items into IDB. Calls getIDBClient() internally. */
	seed: () => Promise<void>;
};

type GameDBSeed = {
	/** Seeds game-specific items into PostgreSQL. Uses prisma client internally. */
	seed: () => Promise<void>;
};

type GameDal = { collectedItems: GameCollectedItemsDal };

type GameMetadata = {
	id: GameId;
	name: string;
	label: string;
	description: string;
	/** CloudFront-relative path to the source PNG used for favicon generation */
	faviconSourcePath: string;
	LogoComponent: ComponentType<{ size?: LogoSize }>;
	/** Third-party resources related to the game */
	externalResources: {
		label: string;
		link: string;
	}[];
};

type GamePages = {
	renderItemLookup: () => ReactNode;
	renderCollectedItems: (args: { mode: CollectedItemsViewMode }) => ReactNode;
};

type GameConfig<
	TItem extends AppItem = AppItem,
	TCategory extends string | number | symbol = string,
> = {
	ITEMS: {
		all: TItem[];
		collectable: TItem[];
		categorized: Record<TCategory, TItem[]>;
		categories: TCategory[];
		uncollectableCategories: TCategory[];
	};
	METADATA: GameMetadata;
	PAGES: GamePages;
	SEARCH_PARAMS: ReturnType<typeof createSearchParamsCache> | undefined;
	THEME: ToolkitThemeDefinition | undefined;
	AVATARS?: GameAvatar[];
	DAL: GameDal;
};

export type {
	GameAvatar,
	GameConfig,
	GameDal,
	GameDBSeed,
	GameIDBSeed,
	GameMetadata,
	GamePages,
};
