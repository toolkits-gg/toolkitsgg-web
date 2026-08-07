import type { AnyRoute } from "@tanstack/react-router";
import { APP_DOMAIN } from "#/constants.ts";
import { isRegisteredGameId } from "#/game-registry/public-registry.ts";

const DEV_DOMAIN = "localhost";

/**
 * Extracts the subdomain label from a Host header. Anchors on a known domain
 * suffix rather than counting dots, so preview hosts and any other unrelated
 * domain resolve to null instead of being read as a subdomain.
 *
 * Deliberately does not consult the game registry - the $gameId route is the
 * single validator for whether a label names a real game.
 */
const subdomainLabel = (hostname: string): string | null => {
	const host = hostname.split(":")[0].toLowerCase();
	if (!host || host === DEV_DOMAIN || host === APP_DOMAIN) return null;
	if (host === "vercel.app" || host.endsWith(".vercel.app")) return null;

	const suffix = host.endsWith(`.${APP_DOMAIN}`)
		? `.${APP_DOMAIN}`
		: host.endsWith(`.${DEV_DOMAIN}`)
			? `.${DEV_DOMAIN}`
			: null;
	if (!suffix) return null;

	const label = host.slice(0, -suffix.length);
	if (!label || label === "www" || label.includes(".")) return null;

	return label;
};

/**
 * Top-level path segments owned by non-game routes. Derived from the root
 * route's children so a new top-level route stays out of the game namespace
 * without anyone remembering to update a list.
 */
const reservedPrefixes = (routeTree: AnyRoute): ReadonlySet<string> => {
	const prefixes = new Set<string>();

	for (const child of routeTree.children ?? []) {
		const segment = child.path?.split("/").filter(Boolean)[0];
		if (segment && !segment.startsWith("$")) prefixes.add(segment);
	}

	return prefixes;
};

const isDevHost = (url: URL): boolean =>
	url.hostname.endsWith(`.${DEV_DOMAIN}`);

const domainSuffix = (url: URL): string =>
	isDevHost(url) ? DEV_DOMAIN : APP_DOMAIN;

const rootHostname = (url: URL): string =>
	isDevHost(url) ? DEV_DOMAIN : `www.${APP_DOMAIN}`;

/**
 * Maps a game subdomain onto the equivalent $gameId path and back, so
 * remnant2.toolkits.gg/items serves /remnant2/items while the address bar and
 * every generated link stay on the short form.
 *
 * Both directions no-op off a subdomain, which keeps www and the apex behaving
 * exactly as they do without a rewrite.
 */
const createSubdomainRewrite = (routeTree: AnyRoute) => {
	const reserved = reservedPrefixes(routeTree);

	return {
		input: ({ url }: { url: URL }): URL | undefined => {
			const label = subdomainLabel(url.hostname);
			if (!label) return undefined;

			const first = url.pathname.split("/").filter(Boolean)[0];
			// Already-prefixed paths pass through so a www URL pasted onto a
			// subdomain resolves instead of double-prefixing into a 404.
			if (first && (reserved.has(first) || first === label)) return undefined;

			url.pathname = `/${label}${url.pathname === "/" ? "" : url.pathname}`;
			return url;
		},

		output: ({ url }: { url: URL }): URL | undefined => {
			const label = subdomainLabel(url.hostname);
			if (!label) return undefined;

			const segments = url.pathname.split("/").filter(Boolean);
			const first = segments[0];

			if (!first) {
				url.hostname = rootHostname(url);
				return url;
			}

			if (reserved.has(first)) return undefined;

			if (first === label) {
				url.pathname = `/${segments.slice(1).join("/")}`;
				return url;
			}

			if (isRegisteredGameId(first)) {
				url.hostname = `${first}.${domainSuffix(url)}`;
				url.pathname = `/${segments.slice(1).join("/")}`;
				return url;
			}

			return undefined;
		},
	};
};

/**
 * Public URL for a game page. Always the production subdomain form,
 * since the same page is also reachable at www.toolkits.gg/{gameId}/...
 */
const gameCanonicalUrl = (gameId: string, pathname: string): string => {
	const prefix = `/${gameId}`;
	const rest = pathname.startsWith(prefix)
		? pathname.slice(prefix.length)
		: pathname;

	return `https://${gameId}.${APP_DOMAIN}${rest || "/"}`;
};

export { createSubdomainRewrite, gameCanonicalUrl, subdomainLabel };
