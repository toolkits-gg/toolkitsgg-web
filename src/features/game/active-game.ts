import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { subdomainLabel } from "#/features/game/subdomain-rewrite.ts";
import { getValidatedGameId } from "#/game-registry/public-registry.ts";
import { parseCookie } from "#/utils.ts";
import type { GameId } from "@/prisma";

const ACTIVE_GAME_COOKIE = "active-game";

/**
 * The gameId sources the client can't read for itself. The router turns a
 * subdomain into a route segment for game paths, but reserved paths (profile,
 * changelog, ...) keep their own path, so the host is the only game signal there.
 */
type ServerResolvedGameIdSources = {
	cookieGameId: GameId | null;
	subdomainGameId: GameId | null;
};

/**
 * Reads the active-game preference cookie and the request host. Used by the
 * root route's beforeLoad to feed the gameId priority chain.
 */
const getServerResolvedGameInputsServerFn = createServerFn({
	method: "GET",
}).handler(async (): Promise<ServerResolvedGameIdSources> => {
	const request = getRequest();
	const cookieHeader = request.headers.get("cookie") ?? "";
	const cookieValue = parseCookie(cookieHeader, ACTIVE_GAME_COOKIE);
	const host = request.headers.get("host") ?? "";
	const label = subdomainLabel(host);
	return {
		cookieGameId: getValidatedGameId(cookieValue ?? "") ?? null,
		subdomainGameId: getValidatedGameId(label ?? "") ?? null,
	};
});

export {
	ACTIVE_GAME_COOKIE,
	getServerResolvedGameInputsServerFn,
	type ServerResolvedGameIdSources,
};
