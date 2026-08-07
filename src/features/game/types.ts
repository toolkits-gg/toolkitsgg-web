import type { SingleParserBuilder } from "nuqs";
import type { createSearchParamsCache } from "nuqs/server";
import type { ComponentType, ReactNode } from "react";
import type {
	GameCollectedItemsData,
	GameCreatedBuildsData,
} from "#/features/game/data/types.ts";
import type { ToolkitThemeDefinition } from "#/features/theme/types.ts";
import type { AppLogoSize } from "#/types.ts";
import type { GameId } from "@/prisma";

type GameFilterDef = {
	key: string;
	label: string;
	defaultValue: string;
	formatValue?: (raw: string) => string;
};

export type AppItemTag = {
	token: string;
	color: { light: string; dark: string };
	description: string | undefined;
	icon?: string;
};

/**
 * Shared item definition across the application
 * Items are defined both in the database and the frontend,
 * but have different properties in each context.
 */
export type AppItem<
	TCategory = string,
	TSubcategory = string,
	TInlineTags = string[],
	TCommunityTags = string[],
	TSearchableTags = string[],
	TLinkedItemOrItems = Record<
		string,
		{ name: string } | Array<{ name: string }>
	>,
> = {
	id: string;
	name: string;
	description: string[];
	imageUrl: string;
	category: TCategory;
	/**
	 * A more specific category for the item, used for better categorization and filtering.
	 * This is for things like a weapon type (eg. "long gun" or "hand gun").
	 */
	subcategory?: TSubcategory;
	/**
	 * Items that are linked to this item, either as a single item or an array of items.
	 * These are things like mods that are linked to a weapon, or a skill that is linked to a character.
	 */
	linkedItems?: TLinkedItemOrItems;
	/**
	 * Text highlighted in the item description.
	 * These are part of the item description, but are highlighted for better visibility.
	 */
	inlineTags?: TInlineTags;
	/**
	 * Tags added by the community for better search and categorization.
	 * These are not part of the item description, but are added by users to help with search and categorization.
	 * They are displayed separately from the item description and can be used to filter items in the UI.
	 */
	communityTags?: TCommunityTags;
	/**
	 * Tags that can be used to search for the item in the UI.
	 * These are not part of the item description, but are used for search functionality.
	 */
	searchableTags?: TSearchableTags;
	/**
	 * A method of identifying the item within the game data.
	 * This is not a user-facing property, but is used internally to link the item to its corresponding data in the game
	 * for things like save game parsing and data fetching.
	 */
	internalSlug?: string;
};

/** Whether a profile tab is viewed by its owner or by another user. */
export type ProfileTabViewMode =
	| { kind: "self" }
	| { kind: "public"; userId: string };

export type CollectedItemsViewMode = ProfileTabViewMode;

export type GameFilterConfig = {
	label: string;
	defs: GameFilterDef[];
	parsers: Record<string, SingleParserBuilder<string>>;
	renderControls: (
		params: Record<string, string>,
		setParam: (key: string, value: string | undefined) => void,
		filteredItems: AppItem[],
	) => ReactNode;
	filterItems: (items: AppItem[], params: Record<string, string>) => AppItem[];
};

export type GameAvatar = {
	id: string;
	name: string;
	imageUrl: string;
	category?: string;
};

export type GameIDBSeed = {
	/** localStorage flag key to prevent re-seeding, e.g. 'idb-seeded-remnant2' */
	seedFlag: string;
	/** Seeds game-specific items into IDB. Calls getIDBClient() internally. */
	seed: () => Promise<void>;
};

export type GameDBSeed = {
	/** Idempotent upserts of the game's reference data. Safe against any environment. */
	seedReferenceData: () => Promise<void>;
	/**
	 * Wipes the game's user-generated data.
	 * Destructive and local-only.
	 */
	resetUserData?: () => Promise<void>;
};

export type GameData = {
	collectedItems: GameCollectedItemsData;
	createdBuilds?: GameCreatedBuildsData;
};

export type GameMetadata = {
	id: GameId;
	name: string;
	label: string;
	description: string;
	/** CloudFront-relative path to the source PNG used for favicon generation */
	faviconSourcePath: string;
	LogoComponent: ComponentType<{ size?: AppLogoSize }>;
	/** Third-party resources related to the game */
	externalResources: {
		label: string;
		link: string;
	}[];
};

export type GamePages = {
	renderHome?: () => ReactNode;
	renderCreateBuild: () => ReactNode | undefined;
	renderViewBuild: () => ReactNode | undefined;
	renderEditBuild: () => ReactNode | undefined;
	renderItemLookup: () => ReactNode;
	renderCollectedItems: (args: { mode: CollectedItemsViewMode }) => ReactNode;
	renderCreatedBuilds?: (args: { mode: ProfileTabViewMode }) => ReactNode;
};

export type GameConfig<
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
	DATA: GameData;
};

export type PublicGameConfig<
	TItem extends AppItem = AppItem,
	TCategory extends string | number | symbol = string,
> = Omit<GameConfig<TItem, TCategory>, "PAGES" | "DATA">;

// Widened type for runtime-keyed access (base AppItem, string category)
export type AnyGameConfig = GameConfig;
