import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { getValidatedGameId } from "#/registry/game-public-registry.tsx";;
import { parseCookie, parseSubdomain } from "#/utils.ts";
import type { GameId } from "@/prisma";

const ACTIVE_GAME_COOKIE = "active-game";

/**
 * Reads everything about the request that the created-builds can know up front:
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
