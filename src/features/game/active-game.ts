import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { getValidatedGameId } from "#/registry/game-public-registry.tsx";
import { parseCookie } from "#/utils.ts";
import type { GameId } from "@/prisma";

const ACTIVE_GAME_COOKIE = "active-game";

/**
 * The only gameId source that the client can't read for itself.
 * The router turns the subdomain into a route segment, so
 * it resolves through the URL like every other source.
 */
type ServerResolvedGameIdSources = {
	cookieGameId: GameId | null;
};

/**
 * Reads the active-game preference cookie. Used by the root route's beforeLoad
 * to feed the gameId priority chain.
 */
const getServerResolvedGameInputsServerFn = createServerFn({
	method: "GET",
}).handler(async (): Promise<ServerResolvedGameIdSources> => {
	const request = getRequest();
	const cookieHeader = request.headers.get("cookie") ?? "";
	const cookieValue = parseCookie(cookieHeader, ACTIVE_GAME_COOKIE);
	return {
		cookieGameId: getValidatedGameId(cookieValue ?? "") ?? null,
	};
});

export {
	ACTIVE_GAME_COOKIE,
	getServerResolvedGameInputsServerFn,
	type ServerResolvedGameIdSources,
};
