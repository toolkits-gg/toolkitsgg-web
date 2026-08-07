import type { AnyRoute } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import {
	createSubdomainRewrite,
	subdomainLabel,
} from "#/features/game/subdomain-rewrite.ts";

// Mirrors the shape createSubdomainRewrite reads off the generated tree:
// root children with a `path`, one of which is the $gameId dynamic segment.
const routeTree = {
	children: [
		{ path: "/" },
		{ path: "/$gameId" },
		{ path: "/profile" },
		{ path: "/changelog" },
		{ path: "/sign-in" },
		{ path: "/sign-up" },
		{ path: "/api/health" },
		{ path: "/account/profile/$userId" },
		{ path: "/api/auth/$" },
	],
} as unknown as AnyRoute;

const { input, output } = createSubdomainRewrite(routeTree);

const rewriteIn = (href: string): string | undefined =>
	input({ url: new URL(href) })?.href;

const rewriteOut = (href: string): string | undefined =>
	output({ url: new URL(href) })?.href;

describe("subdomainLabel", () => {
	it("returns null for root hosts", () => {
		expect(subdomainLabel("toolkits.gg")).toBeNull();
		expect(subdomainLabel("www.toolkits.gg")).toBeNull();
		expect(subdomainLabel("localhost")).toBeNull();
		expect(subdomainLabel("localhost:3000")).toBeNull();
	});

	it("returns null for Vercel preview hosts", () => {
		expect(subdomainLabel("toolkitsgg-web-abc123.vercel.app")).toBeNull();
		expect(subdomainLabel("vercel.app")).toBeNull();
	});

	it("returns null for unrelated domains", () => {
		expect(subdomainLabel("remnant2.example.com")).toBeNull();
		expect(subdomainLabel("toolkits.gg.evil.com")).toBeNull();
	});

	it("returns null for nested labels", () => {
		expect(subdomainLabel("a.b.toolkits.gg")).toBeNull();
	});

	it("extracts the label without consulting the registry", () => {
		expect(subdomainLabel("remnant2.toolkits.gg")).toBe("remnant2");
		expect(subdomainLabel("taco.toolkits.gg")).toBe("taco");
		expect(subdomainLabel("REMNANT2.Toolkits.GG")).toBe("remnant2");
		expect(subdomainLabel("remnant2.localhost:3000")).toBe("remnant2");
	});
});

describe("subdomain rewrite input", () => {
	it("maps the subdomain root onto the game route", () => {
		expect(rewriteIn("https://remnant2.toolkits.gg/")).toBe(
			"https://remnant2.toolkits.gg/remnant2",
		);
	});

	it("prefixes game-scoped subpaths", () => {
		expect(rewriteIn("https://remnant2.toolkits.gg/items")).toBe(
			"https://remnant2.toolkits.gg/remnant2/items",
		);
		expect(rewriteIn("https://remnant2.toolkits.gg/build/create")).toBe(
			"https://remnant2.toolkits.gg/remnant2/build/create",
		);
	});

	it("preserves search and hash", () => {
		expect(rewriteIn("https://remnant2.toolkits.gg/items?q=ring#top")).toBe(
			"https://remnant2.toolkits.gg/remnant2/items?q=ring#top",
		);
	});

	it("leaves reserved top-level routes alone", () => {
		expect(rewriteIn("https://remnant2.toolkits.gg/changelog")).toBeUndefined();
		expect(rewriteIn("https://remnant2.toolkits.gg/sign-in")).toBeUndefined();
		expect(rewriteIn("https://remnant2.toolkits.gg/profile")).toBeUndefined();
		expect(
			rewriteIn("https://remnant2.toolkits.gg/account/profile/abc"),
		).toBeUndefined();
		expect(
			rewriteIn("https://remnant2.toolkits.gg/api/health"),
		).toBeUndefined();
	});

	it("does not double-prefix an already game-scoped path", () => {
		expect(
			rewriteIn("https://remnant2.toolkits.gg/remnant2/items"),
		).toBeUndefined();
	});

	it("prefixes unregistered labels so $gameId can 404 them", () => {
		expect(rewriteIn("https://taco.toolkits.gg/")).toBe(
			"https://taco.toolkits.gg/taco",
		);
		expect(rewriteIn("https://taco.toolkits.gg/items")).toBe(
			"https://taco.toolkits.gg/taco/items",
		);
	});

	it("no-ops off a subdomain", () => {
		expect(rewriteIn("https://www.toolkits.gg/remnant2/items")).toBeUndefined();
		expect(rewriteIn("https://toolkits.gg/")).toBeUndefined();
		expect(rewriteIn("http://localhost:3000/remnant2/items")).toBeUndefined();
	});
});

describe("subdomain rewrite output", () => {
	it("strips the prefix for same-game links", () => {
		expect(rewriteOut("https://remnant2.toolkits.gg/remnant2/items")).toBe(
			"https://remnant2.toolkits.gg/items",
		);
		expect(rewriteOut("https://remnant2.toolkits.gg/remnant2")).toBe(
			"https://remnant2.toolkits.gg/",
		);
	});

	it("sends other games to their own subdomain", () => {
		expect(rewriteOut("https://remnant2.toolkits.gg/clairobscur/items")).toBe(
			"https://clairobscur.toolkits.gg/items",
		);
	});

	it("sends the shared home to the root host", () => {
		expect(rewriteOut("https://remnant2.toolkits.gg/")).toBe(
			"https://www.toolkits.gg/",
		);
	});

	it("keeps reserved routes on the current host", () => {
		expect(
			rewriteOut("https://remnant2.toolkits.gg/changelog"),
		).toBeUndefined();
		expect(rewriteOut("https://remnant2.toolkits.gg/profile")).toBeUndefined();
	});

	it("leaves unrecognized paths alone", () => {
		expect(rewriteOut("https://remnant2.toolkits.gg/nonsense")).toBeUndefined();
	});

	it("no-ops off a subdomain, so www keeps path-based URLs", () => {
		expect(
			rewriteOut("https://www.toolkits.gg/remnant2/items"),
		).toBeUndefined();
		expect(rewriteOut("http://localhost:3000/remnant2/items")).toBeUndefined();
	});

	it("stays on the dev domain and port in development", () => {
		expect(rewriteOut("http://remnant2.localhost:3000/clairobscur/items")).toBe(
			"http://clairobscur.localhost:3000/items",
		);
		expect(rewriteOut("http://remnant2.localhost:3000/")).toBe(
			"http://localhost:3000/",
		);
	});
});
