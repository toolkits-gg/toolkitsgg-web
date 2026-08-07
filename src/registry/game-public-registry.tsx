import type { ComponentType } from "react";
import type { AnyGameConfig, GameAvatar } from "#/features/game/types.ts";
import type { ToolkitThemeDefinition } from "#/features/theme/types.ts";
import { ITEMS as CLAIROBSCUR_ITEMS } from "#/games/clairobscur/core/game-config/items.ts";
import { METADATA as CLAIROBSCUR_METADATA } from "#/games/clairobscur/core/game-config/metadata.tsx";
import { THEME as CLAIROBSCUR_THEME } from "#/games/clairobscur/core/game-config/theme.ts";
import { AVATARS as REMNANT2_AVATARS } from "#/games/remnant2/core/game-config/avatars.ts";
import { ITEMS as REMNANT2_ITEMS } from "#/games/remnant2/core/game-config/items.ts";
import { METADATA as REMNANT2_METADATA } from "#/games/remnant2/core/game-config/metadata.tsx";
import { THEME as REMNANT2_THEME } from "#/games/remnant2/core/game-config/theme.ts";
import { AVATARS as SLAYTHESPIRE2_AVATARS } from "#/games/slaythespire2/core/game-config/avatars.ts";
import { ITEMS as SLAYTHESPIRE2_ITEMS } from "#/games/slaythespire2/core/game-config/items.ts";
import { METADATA as SLAYTHESPIRE2_METADATA } from "#/games/slaythespire2/core/game-config/metadata.tsx";
import { THEME as SLAYTHESPIRE2_THEME } from "#/games/slaythespire2/core/game-config/theme.ts";
import type { AppLogoSize } from "#/types.ts";
import type { GameId } from "@/prisma";

type PublicGameConfig = {
	ITEMS: {
		all: readonly unknown[];
		collectable: readonly unknown[];
		categorized: Record<string, readonly unknown[]>;
		categories: readonly string[];
		uncollectableCategories: readonly string[];
	};
	METADATA: {
		label: string;
		LogoComponent: ComponentType<{ size?: AppLogoSize }>;
	};
	THEME:
		| {
				label: string;
				className: string;
		  }
		| undefined;
	AVATARS?: GameAvatar[];
};

export const PUBLIC_GAME_REGISTRY = {
	clairobscur: {
		ITEMS: CLAIROBSCUR_ITEMS,
		METADATA: CLAIROBSCUR_METADATA,
		THEME: CLAIROBSCUR_THEME,
		AVATARS: undefined,
	},
	remnant2: {
		ITEMS: REMNANT2_ITEMS,
		METADATA: REMNANT2_METADATA,
		THEME: REMNANT2_THEME,
		AVATARS: REMNANT2_AVATARS,
	},
	slaythespire2: {
		ITEMS: SLAYTHESPIRE2_ITEMS,
		METADATA: SLAYTHESPIRE2_METADATA,
		THEME: SLAYTHESPIRE2_THEME,
		AVATARS: SLAYTHESPIRE2_AVATARS,
	},
} satisfies Record<Exclude<GameId, "none">, PublicGameConfig>;

export type PublicRegistryGameId = keyof typeof PUBLIC_GAME_REGISTRY;

export const REGISTERED_GAME_IDS: readonly PublicRegistryGameId[] = Object.keys(
	PUBLIC_GAME_REGISTRY,
) as PublicRegistryGameId[];

export const isRegisteredGameId = (id: string): id is PublicRegistryGameId =>
	id in PUBLIC_GAME_REGISTRY;

export const getValidatedGameId = (id: string): GameId | undefined =>
	isRegisteredGameId(id) ? (id as GameId) : undefined;

// Runtime-keyed getters. Return types are widened to AnyGameConfig's base shapes
// so callers get the usable `AppItem`/`GameMetadata` types rather than the loose
// `unknown`-based PublicGameConfig used only for the `satisfies` check above.
export const getGameMetadata = (
	gameId: string,
): AnyGameConfig["METADATA"] | undefined =>
	PUBLIC_GAME_REGISTRY[gameId as PublicRegistryGameId]?.METADATA;

export const getGameItems = (
	gameId: string,
): AnyGameConfig["ITEMS"] | undefined =>
	PUBLIC_GAME_REGISTRY[gameId as PublicRegistryGameId]?.ITEMS;

export const getGameTheme = (
	gameId: string,
): ToolkitThemeDefinition | undefined =>
	PUBLIC_GAME_REGISTRY[gameId as PublicRegistryGameId]?.THEME;

export const getGameAvatars = (gameId: string): GameAvatar[] | undefined =>
	PUBLIC_GAME_REGISTRY[gameId as PublicRegistryGameId]?.AVATARS;

export const getGameLogoComponent = (
	gameId: string,
): ComponentType<{ size?: AppLogoSize }> | undefined =>
	PUBLIC_GAME_REGISTRY[gameId as PublicRegistryGameId]?.METADATA?.LogoComponent;
