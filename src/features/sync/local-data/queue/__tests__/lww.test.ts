import { describe, expect, it } from "vitest";
import { compareTimestamps } from "#/features/sync/local-data/last-write-wins.ts";

const T1 = "2026-01-01T00:00:00.000Z";
const T2 = "2026-01-02T00:00:00.000Z";
const T3 = "2026-01-03T00:00:00.000Z";

describe("compareTimestamps", () => {
	it("returns local-wins when the server record is missing", () => {
		expect(
			compareTimestamps(null, { serverUpdatedAt: T1, updatedAt: T2 }),
		).toBe("local-wins");
	});

	it("returns server-wins when the server advanced past the baseline", () => {
		expect(
			compareTimestamps(
				{ updatedAt: T3 },
				{ serverUpdatedAt: T1, updatedAt: T2 },
			),
		).toBe("server-wins");
	});

	it("returns equal when the server matches the baseline", () => {
		expect(
			compareTimestamps(
				{ updatedAt: T1 },
				{ serverUpdatedAt: T1, updatedAt: T2 },
			),
		).toBe("equal");
	});

	it("falls back to comparing op.updatedAt when baseline is absent", () => {
		expect(compareTimestamps({ updatedAt: T1 }, { updatedAt: T2 })).toBe(
			"local-wins",
		);
		expect(compareTimestamps({ updatedAt: T3 }, { updatedAt: T2 })).toBe(
			"server-wins",
		);
	});

	it("treats invalid dates as missing", () => {
		expect(
			compareTimestamps({ updatedAt: "not-a-date" }, { updatedAt: T1 }),
		).toBe("local-wins");
	});
});
