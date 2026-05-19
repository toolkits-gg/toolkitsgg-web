import type { ComponentType } from "react";
import type { LogoSize } from "#/components/AppLogo";
import type { GameAvatar, GameConfig } from "#/features/game/core/types";
import type { ToolkitThemeDefinition } from "#/features/theme/core/types";
import { defaultTheme } from "#/features/theme/themes/default-theme";
import { GAME_CONFIG as CLAIROBSCUR_CONFIG } from "#/games/clairobscur/core/game-config";
import { GAME_CONFIG as REMNANT2_CONFIG } from "#/games/remnant2/core/game-config";
import { GAME_CONFIG as SLAYTHESPIRE2_CONFIG } from "#/games/slaythespire2/core/game-config";
import type { GameId } from "@/prisma";

// Widened type for runtime-keyed access (base AppItem, string category)
type AnyGameConfig = GameConfig;

// The registry — keys are the exact gameId strings
const GAME_REGISTRY = {
	clairobscur: CLAIROBSCUR_CONFIG,
	remnant2: REMNANT2_CONFIG,
	slaythespire2: SLAYTHESPIRE2_CONFIG,
} satisfies Record<Exclude<GameId, "none">, AnyGameConfig>;

type RegistryGameId = keyof typeof GAME_REGISTRY;

const REGISTERED_GAME_IDS: readonly RegistryGameId[] = Object.keys(
	GAME_REGISTRY,
) as RegistryGameId[];

// type guard
function isRegisteredGameId(id: string): id is RegistryGameId {
	return id in GAME_REGISTRY;
}

function getValidatedGameId(id: string): GameId | undefined {
	return id in GAME_REGISTRY ? (id as GameId) : undefined;
}

// Generic runtime lookup — returns widened AnyGameConfig or undefined
function getGameConfig(gameId: string): AnyGameConfig | undefined {
	return GAME_REGISTRY[gameId as RegistryGameId];
}

// Items shortcut — returns ITEMS bucket or undefined
function getGameItems(gameId: string): AnyGameConfig["ITEMS"] | undefined {
	return GAME_REGISTRY[gameId as RegistryGameId]?.ITEMS as
		| AnyGameConfig["ITEMS"]
		| undefined;
}

// Logo shortcut - returns METADATA.LogoComponent or undefined
function getGameLogoComponent(
	gameId: string,
): ComponentType<{ size?: LogoSize }> | undefined {
	return GAME_REGISTRY[gameId as RegistryGameId]?.METADATA?.LogoComponent;
}

// Search params shortcut - returns SEARCH_PARAMS or undefined
function getGameSearchParams(
	gameId: string,
): AnyGameConfig["SEARCH_PARAMS"] | undefined {
	return GAME_REGISTRY[gameId as RegistryGameId]?.SEARCH_PARAMS;
}

// Theme shortcut — returns ToolkitThemeDefinition or undefined
function getGameTheme(gameId: string): ToolkitThemeDefinition | undefined {
	return GAME_REGISTRY[gameId as RegistryGameId]?.THEME;
}

// Metadata shortcut - returns METADATA or undefined
function getGameMetadata(
	gameId: string,
): AnyGameConfig["METADATA"] | undefined {
	return GAME_REGISTRY[gameId as RegistryGameId]?.METADATA;
}

// Pages shortcut — returns PAGES bucket or undefined
function getGamePages(gameId: string): AnyGameConfig["PAGES"] | undefined {
	return GAME_REGISTRY[gameId as RegistryGameId]?.PAGES;
}

// Avatars shortcut — returns AVATARS array or undefined
function getGameAvatars(gameId: string): GameAvatar[] | undefined {
	return (GAME_REGISTRY[gameId as RegistryGameId] as AnyGameConfig | undefined)
		?.AVATARS;
}

// Type-safe overload when the caller already holds a literal RegistryGameId.
// Return type preserves the original narrow generics from satisfies.
function getGameConfigTyped<TId extends RegistryGameId>(
	gameId: TId,
): (typeof GAME_REGISTRY)[TId] {
	return GAME_REGISTRY[gameId];
}

// Return an array of all THEME defintions across registered games (for validation, theme switcher dropdowns, etc.)
function getAllRegisteredThemeDefinitions(): ToolkitThemeDefinition[] {
	const definitions: ToolkitThemeDefinition[] = [
		{
			label: "Default Light",
			className: "default-light",
			theme: defaultTheme,
		},
		{
			label: "Default Dark",
			className: "default-dark",
			theme: defaultTheme,
		},
	];

	for (const gameId of REGISTERED_GAME_IDS) {
		const theme = getGameTheme(gameId);
		if (theme) {
			definitions.push({
				label: `${theme.label} - Light`,
				className: `${theme.className}-light`,
				theme: theme.theme,
			});
			definitions.push({
				label: `${theme.label} - Dark`,
				className: `${theme.className}-dark`,
				theme: theme.theme,
			});
		}
	}
	return definitions;
}

// Return an array of all THEME classNames across registered games (for validation, theme switcher dropdowns, etc.)
function getAllRegisteredThemeClassNames(): string[] {
	return getAllRegisteredThemeDefinitions()
		.map((def) => def.className)
		.sort();
}

export {
	GAME_REGISTRY,
	REGISTERED_GAME_IDS,
	getAllRegisteredThemeClassNames,
	getAllRegisteredThemeDefinitions,
	getGameAvatars,
	getGameConfig,
	getGameLogoComponent,
	getGameItems,
	getGameMetadata,
	getGamePages,
	getGameSearchParams,
	getGameTheme,
	getGameConfigTyped,
	isRegisteredGameId,
	getValidatedGameId,
};

export type { AnyGameConfig, RegistryGameId };
