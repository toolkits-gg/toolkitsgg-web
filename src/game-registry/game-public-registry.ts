import type { ComponentType } from "react";
import type { LogoSize } from "#/components/AppLogo.tsx";
import type {
	AnyGameConfig,
	GameAvatar,
	PublicGameConfig,
} from "#/features/game/types.ts";
import type { ToolkitThemeDefinition } from "#/features/theme/types.ts";
import { PUBLIC_GAME_CONFIG as COE33_PUBLIC_GAME_CONFIG } from "#/games/clairobscur/core/game-config";
import { PUBLIC_GAME_CONFIG as REMNANT2_PUBLIC_GAME_CONFIG } from "#/games/remnant2/core/game-config";
import { PUBLIC_GAME_CONFIG as SLAYTHESPIRE2_PUBLIC_GAME_CONFIG } from "#/games/slaythespire2/core/game-config";
import type { GameId } from "@/prisma";

// biome-ignore lint/style/useExportsLast: {Needed for derived value}
export const PUBLIC_GAME_REGISTRY = {
	clairobscur: COE33_PUBLIC_GAME_CONFIG,
	remnant2: REMNANT2_PUBLIC_GAME_CONFIG,
	slaythespire2: SLAYTHESPIRE2_PUBLIC_GAME_CONFIG,
} satisfies Record<Exclude<GameId, "none">, PublicGameConfig>;

type PublicRegistryGameId = keyof typeof PUBLIC_GAME_REGISTRY;

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
): ComponentType<{ size?: LogoSize }> | undefined =>
	PUBLIC_GAME_REGISTRY[gameId as PublicRegistryGameId]?.METADATA?.LogoComponent;
