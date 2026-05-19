import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { parseCookie, parseSubdomain } from "#/features/game/core/utils";
import { getValidatedGameId } from "#/features/game/registry/game-registry";
import type { GameId } from "@/prisma";

const ACTIVE_GAME_COOKIE = "active-game";

/**
 * Reads everything about the request that the server can know up front:
 * the subdomain (Host header) and the active-game preference cookie.
 * Used by the root route's beforeLoad to feed the gameId priority chain.
 */
const getServerResolvedGameInputsServerFn = createServerFn({
	method: "GET",
}).handler(
	async (): Promise<{
		subdomainGameId: GameId | null;
		cookieGameId: GameId | null;
	}> => {
		const request = getRequest();
		const host = request.headers.get("host") ?? "";
		const cookieHeader = request.headers.get("cookie") ?? "";
		const subdomainGameId = parseSubdomain(host);
		const cookieValue = parseCookie(cookieHeader, ACTIVE_GAME_COOKIE);
		return {
			subdomainGameId: subdomainGameId ?? null,
			cookieGameId: getValidatedGameId(cookieValue ?? "") ?? null,
		};
	},
);

export { ACTIVE_GAME_COOKIE, getServerResolvedGameInputsServerFn };
