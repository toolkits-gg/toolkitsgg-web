import { describe, expect, it } from "vitest";
import { chooseBackend } from "#/features/dal/choose-backend.ts";

describe("chooseBackend", () => {
	it.each([
		{ authed: true, online: true, expected: "remote" as const },
		{ authed: true, online: false, expected: "local" as const },
		{ authed: false, online: true, expected: "local" as const },
		{ authed: false, online: false, expected: "local" as const },
	])("authed=$authed online=$online -> $expected", ({
		authed,
		online,
		expected,
	}) => {
		expect(chooseBackend({ authed, online })).toBe(expected);
	});
});
