import type { SingleParserBuilder } from "nuqs";
import type { ReactNode } from "react";
import type { DalReadAction, DalWriteAction } from "#/features/dal/types.ts";

/**
 * Shared item definition across the application
 * Items are defined both in the database and the frontend,
 * but have different properties in each context.
 */
type AppItem<
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

type ItemTag = {
	type: string;
	token: string;
	color: { light: string; dark: string };
	description: string | undefined;
	icon?: string;
};

type GameFilterDef = {
	key: string;
	label: string;
	defaultValue: string;
	serialize: (value: string) => string | undefined;
	formatValue?: (raw: string) => string;
};

type GameFilterConfig = {
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

type CollectItemInput = { itemId: string; itemName: string };
type CollectedItemRecord = {
	userId: string;
	itemId: string;
	updatedAt?: Date | string | null;
};

type CollectedItemsViewMode =
	| { kind: "self" }
	| { kind: "public"; userId: string };

type GameCollectedItemsDal = {
	list: DalReadAction<void, CollectedItemRecord[]>;
	collect: DalWriteAction<CollectItemInput, CollectedItemRecord>;
	uncollect: DalWriteAction<CollectItemInput, { ok: true }>;
	listByUserIdServerFn: (input: {
		data: { userId: string };
	}) => Promise<CollectedItemRecord[]>;
};

export type {
	AppItem,
	CollectedItemRecord,
	CollectedItemsViewMode,
	CollectItemInput,
	GameCollectedItemsDal,
	GameFilterConfig,
	ItemTag,
};
