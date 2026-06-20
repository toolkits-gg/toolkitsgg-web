import { isRegisteredGameId } from "#/features/game/registry/game-registry.tsx";
import type { GameId } from "@/prisma";

const ROOT_DOMAINS = ["toolkits.gg", "www.toolkits.gg", "localhost"];

const parseSubdomain = (hostname: string): GameId | null => {
	// Strip port (e.g. localhost:3000)
	const host = hostname.split(":")[0];

	// No subdomain possible on bare localhost
	if (host === "localhost") return null;

	// Check against known root domains
	for (const root of ROOT_DOMAINS) {
		if (host === root) return null;
	}

	// e.g. "remnant2.toolkits.gg" -> ["remnant2", "toolkits", "gg"]
	const parts = host.split(".");

	// Need at least 3 parts for a subdomain: [sub, domain, tld]
	if (parts.length < 3) return null;

	const subdomain = parts[0];

	// Reject "www" explicitly in case it slips through
	if (subdomain === "www") return null;

	// Reject invalid subdomains
	if (!isRegisteredGameId(subdomain)) return null;

	return subdomain;
};

/**
 * Writes the active-game preference cookie from the client.
 * Read on the server in beforeLoad to seed the gameId resolution chain.
 * `null` clears the cookie.
 */
const setActiveGameCookie = (value: string | null): void => {
	if (typeof document === "undefined") return;
	const base = `active-game=${value ? encodeURIComponent(value) : ""}; path=/; samesite=lax`;
	const maxAge = value ? "; max-age=31536000" : "; max-age=0";
	const secure = import.meta.env.PROD ? "; secure" : "";
	// biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API isn't supported in Safari/Firefox.
	document.cookie = `${base}${maxAge}${secure}`;
};

/**
 * Tiny cookie-header parser for server-side reads. Returns the decoded value of
 * the named cookie or null if absent. Format: "a=1; b=2; c=3".
 */
const parseCookie = (header: string, name: string): string | null => {
	const parts = header.split(/;\s*/);
	for (const part of parts) {
		const eq = part.indexOf("=");
		if (eq === -1) continue;
		const k = part.slice(0, eq);
		if (k !== name) continue;
		const v = part.slice(eq + 1);
		try {
			return decodeURIComponent(v);
		} catch {
			return v;
		}
	}
	return null;
};

export { parseCookie, parseSubdomain, setActiveGameCookie };
