// Favorite games: client-safe input validation plus the TanStack server-fn
// wrappers. Each wrapper delegates to ./favorite-games.server.ts; those imports
// are referenced only inside handler bodies, so the compiler strips them (and
// prisma) from the client bundle.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	favoriteGame,
	listFavoriteGames,
	unfavoriteGame,
} from "#/features/game/data/favorite-games/favorite-games.server.ts";
import { REGISTERED_GAME_IDS } from "#/registry/game-public-registry.tsx";

import type { GameId } from "@/prisma";

const GAME_ID_SET = new Set<string>(REGISTERED_GAME_IDS);
const isGameId = (value: string): value is GameId => GAME_ID_SET.has(value);

const FavoriteInput = z.object({ gameId: z.string().refine(isGameId) });

export const favoriteGameServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => FavoriteInput.parse(v))
	.handler(async ({ data }) => favoriteGame(data.gameId));

export const unfavoriteGameServerFn = createServerFn({ method: "POST" })
	.validator((v: unknown) => FavoriteInput.parse(v))
	.handler(async ({ data }) => unfavoriteGame(data.gameId));

export const listFavoriteGamesServerFn = createServerFn({
	method: "GET",
}).handler(async () => listFavoriteGames());
