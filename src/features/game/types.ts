import type { SingleParserBuilder } from "nuqs";
import type { createSearchParamsCache } from "nuqs/server";
import type { ComponentType, ReactNode } from "react";
import type {
	BuildLoadoutEntry,
	CreatedBuildRecord,
	GameBuildsData,
} from "#/features/game/data/types";
import type { ToolkitThemeDefinition } from "#/features/theme/types";
import type { AppLogoSize } from "#/types";
import type { GameId } from "@/prisma";

/**
 * A game's map of relationship name to the item(s) that relationship points at.
 * Games declare their own keys, but every value must be resolvable by name.
 */
type AppLinkedItems<TRef extends AppLinkedItemRef = AppLinkedItemRef> = Record<
	string,
	TRef | TRef[] | undefined
>;

type BuildToolMode = "create" | "edit" | "view";

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
 * A reference to another item by name.
 * Games can narrow TName when their relationship targets are known.
 */
export type AppLinkedItemRef<TName extends string = string> = { name: TName };

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
	TLinkedItems extends AppLinkedItems = AppLinkedItems,
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
	linkedItems?: TLinkedItems;
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

export type WallpaperAttribution = {
	/** Credited creator, e.g. "ConRaven". The "Courtesy of" wording is the UI's. */
	name: string;
	/** Optional profile or source link. Rendered as an external anchor when present. */
	url?: string;
};

export type GameWallpaper = {
	id: string;
	/** Optional: art that isn't worth labelling ships without one. */
	name?: string;
	/** Path relative to the game's CDN root, e.g. "/enemies/boss/abomination1.jpg". */
	imageUrl: string;
	/**
	 * Overrides the derived resized-variant path for art that doesn't follow the
	 * `<dir>/resized/<base>-<w>x<h><ext>` convention the gulp task writes.
	 */
	thumbnailUrl?: string;
	/**
	 * Per-image, not per-game: credit belongs to whoever captured that shot, so a
	 * later addition by someone else stays uncredited rather than inheriting a
	 * default.
	 */
	attribution?: WallpaperAttribution;
};

/**
 * Moves a game's locally-owned IDB rows between user ids. Games declare this
 * because only they know which of their tables are owner-keyed; the sign-in
 * claim runs it for every registered game without knowing any of their names.
 */
export type GameLocalClaim = {
	claimLocalRows: (fromUserId: string, toUserId: string) => Promise<void>;
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

/**
 * What the app-level build editor hands a game's build tool. The tool is a
 * controlled component: it renders the game's item-selection UI and reports the
 * resulting loadout back up, while the shell owns saving, local queueing,
 * dirty state, and every field that isn't game-specific.
 */
export type BuildToolRenderArgs = {
	mode: BuildToolMode;
	value: BuildLoadoutEntry[];
	onChange: (next: BuildLoadoutEntry[]) => void;
	readOnly: boolean;
	/** True while a screenshot capture is in flight; render the print-friendly layout. */
	screenshotMode: boolean;
	/** The persisted build, or null while creating. */
	build: CreatedBuildRecord | null;
};

export type BuildTagOption = { value: string; label: string };

/**
 * Everything a game must supply to opt into builds. Absence of this config in
 * the builds registry is the opt-out: no build routes, nav links, or profile
 * tabs are rendered for that game.
 */
export type GameBuildsConfig = {
	data: GameBuildsData;
	renderBuildTool: (args: BuildToolRenderArgs) => ReactNode;
	/** The game's build-tag enum, surfaced as MultiSelect options. */
	tagOptions?: BuildTagOption[];
};

export type GameMetadata = {
	id: GameId;
	name: string;
	label: string;
	description: string;
	LogoComponent: ComponentType<{ size?: AppLogoSize }>;
	/** Third-party resources related to the game */
	externalResources: {
		label: string;
		link: string;
	}[];
};

export type GamePages = {
	renderHome?: () => ReactNode;
	renderItemLookup: () => ReactNode;
	renderCollectedItems: (args: { mode: CollectedItemsViewMode }) => ReactNode;
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
	};
	METADATA: GameMetadata;
	SEARCH_PARAMS: ReturnType<typeof createSearchParamsCache> | undefined;
	THEME: ToolkitThemeDefinition | undefined;
	AVATARS?: GameAvatar[];
	/** Absent when the game has no downloadable artwork. Presence is the opt-in. */
	WALLPAPERS?: GameWallpaper[];
	/** Absent when the game has no terms worth highlighting in description text. */
	INLINE_TAGS?: AppItemTag[];
};

/**
 * What a game exports from its config barrel. Pages, builds, seeds, and sync
 * handlers are deliberately not here: each is consumed by a different bundling
 * tier and reaches the app through its own registry.
 */
export type PublicGameConfig<
	TItem extends AppItem = AppItem,
	TCategory extends string | number | symbol = string,
> = GameConfig<TItem, TCategory>;

// Widened type for runtime-keyed access (base AppItem, string category)
export type AnyGameConfig = GameConfig;
