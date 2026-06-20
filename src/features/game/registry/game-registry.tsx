import type { ComponentType } from "react";
import type { LogoSize } from "#/components/AppLogo";
import type { GameAvatar, GameConfig } from "#/features/game/types.ts";
import { defaultTheme } from "#/features/theme/themes/default-theme";
import type { ToolkitThemeDefinition } from "#/features/theme/types.ts";
import { GAME_CONFIG as CLAIROBSCUR_CONFIG } from "#/games/clairobscur/core/game-config";
import { GAME_CONFIG as REMNANT2_CONFIG } from "#/games/remnant2/core/game-config";
import { GAME_CONFIG as SLAYTHESPIRE2_CONFIG } from "#/games/slaythespire2/core/game-config";
import type { GameId } from "@/prisma";

// Widened type for runtime-keyed access (base AppItem, string category)
export type AnyGameConfig = GameConfig;

export type RegistryGameId = keyof typeof GAME_REGISTRY;

// The registry — keys are the exact gameId strings
export const GAME_REGISTRY = {
	clairobscur: CLAIROBSCUR_CONFIG,
	remnant2: REMNANT2_CONFIG,
	slaythespire2: SLAYTHESPIRE2_CONFIG,
} satisfies Record<Exclude<GameId, "none">, AnyGameConfig>;

export const REGISTERED_GAME_IDS: readonly RegistryGameId[] = Object.keys(
	GAME_REGISTRY,
) as RegistryGameId[];

/** Type guard */
export const isRegisteredGameId = (id: string): id is RegistryGameId =>
	id in GAME_REGISTRY;

export const getValidatedGameId = (id: string): GameId | undefined =>
	id in GAME_REGISTRY ? (id as GameId) : undefined;

export const getGameConfig = (gameId: string): AnyGameConfig | undefined =>
	GAME_REGISTRY[gameId as RegistryGameId];

export const getGameItems = (
	gameId: string,
): AnyGameConfig["ITEMS"] | undefined =>
	GAME_REGISTRY[gameId as RegistryGameId]?.ITEMS as
		| AnyGameConfig["ITEMS"]
		| undefined;

export const getGameLogoComponent = (
	gameId: string,
): ComponentType<{ size?: LogoSize }> | undefined =>
	GAME_REGISTRY[gameId as RegistryGameId]?.METADATA?.LogoComponent;

export const getGameTheme = (
	gameId: string,
): ToolkitThemeDefinition | undefined =>
	GAME_REGISTRY[gameId as RegistryGameId]?.THEME;

export const getGameMetadata = (
	gameId: string,
): AnyGameConfig["METADATA"] | undefined =>
	GAME_REGISTRY[gameId as RegistryGameId]?.METADATA;

export const getGamePages = (
	gameId: string,
): AnyGameConfig["PAGES"] | undefined =>
	GAME_REGISTRY[gameId as RegistryGameId]?.PAGES;

export const getGameAvatars = (gameId: string): GameAvatar[] | undefined =>
	(GAME_REGISTRY[gameId as RegistryGameId] as AnyGameConfig | undefined)
		?.AVATARS;

// Return an array of all THEME defintions across registered games (for validation, theme switcher dropdowns, etc.)
export const getAllRegisteredThemeDefinitions =
	(): ToolkitThemeDefinition[] => {
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
	};

export const getAllRegisteredThemeClassNames = (): string[] =>
	getAllRegisteredThemeDefinitions()
		.map((def) => def.className)
		.sort();
