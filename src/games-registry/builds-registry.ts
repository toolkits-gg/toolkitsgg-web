/**
 * Explicit games-registry of build configs.
 *
 * Builds are opt-in: a game appears here only if it has build tables and a build
 * tool component. Absence is the opt-out, and it is the single source of truth:
 * routes, nav links, and profile tabs all gate on `gameSupportsBuilds` rather
 * than on a separate capability flag that could drift.
 */
import type { GameBuildsConfig } from "#/features/game/types";
import { BUILDS as REMNANT2_BUILDS } from "#/games/remnant2/core/game-config/builds";
import type { PublicRegistryGameId } from "#/games-registry/public-registry";

const GAME_BUILDS_REGISTRY: Partial<
	Record<PublicRegistryGameId, GameBuildsConfig>
> = {
	remnant2: REMNANT2_BUILDS,
};

const getGameBuilds = (
	gameId: string | undefined,
): GameBuildsConfig | undefined =>
	gameId === undefined
		? undefined
		: GAME_BUILDS_REGISTRY[gameId as PublicRegistryGameId];

const gameSupportsBuilds = (gameId: string | undefined): boolean =>
	getGameBuilds(gameId) !== undefined;

export { gameSupportsBuilds, getGameBuilds };
