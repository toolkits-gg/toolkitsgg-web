// @vitest-environment jsdom
import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	_resetForTests,
	clearSynced,
	deleteOp,
	enqueueOp,
	getOp,
	listOps,
	markStatus,
} from "#/features/sync/queue/pending-ops";

const BASE = {
	anonUserId: "anon-1",
	entity: "remnant2CollectedItem",
	operation: "upsert" as const,
	payload: { itemId: "item-1" },
	idempotencyKey: "remnant2CollectedItem:upsert:anon-1:item-1",
};

beforeEach(async () => {
	await _resetForTests();
});

afterEach(async () => {
	await _resetForTests();
});

describe("pending-ops queue", () => {
	it("enqueues an op with generated id and default status", async () => {
		const op = await enqueueOp(BASE);
		expect(op).not.toBeNull();
		expect(op?.id).toMatch(/[-0-9a-f]{36}/);
		expect(op?.status).toBe("pending");
		expect(op?.createdAt).toBeTypeOf("string");
	});

	it("lists ops ordered by createdAt with filters", async () => {
		const a = await enqueueOp({ ...BASE, idempotencyKey: "a" });
		await new Promise((r) => setTimeout(r, 2));
		const b = await enqueueOp({
			...BASE,
			entity: "userFavoriteGame",
			idempotencyKey: "b",
		});

		const all = await listOps();
		expect(all.map((o) => o.id)).toEqual([a?.id, b?.id]);

		const onlyFav = await listOps({ entity: "userFavoriteGame" });
		expect(onlyFav.map((o) => o.id)).toEqual([b?.id]);
	});

	it("marks status and stores lastError", async () => {
		const op = await enqueueOp(BASE);
		if (!op) throw new Error("enqueue failed");
		const failed = await markStatus(op.id, "failed", "boom");
		expect(failed?.status).toBe("failed");
		expect(failed?.lastError).toBe("boom");
	});

	it("deletes a single op", async () => {
		const op = await enqueueOp(BASE);
		if (!op) throw new Error("enqueue failed");
		await deleteOp(op.id);
		expect(await getOp(op.id)).toBeNull();
	});

	it("clearSynced removes only synced rows and returns count", async () => {
		const a = await enqueueOp({ ...BASE, idempotencyKey: "a" });
		const b = await enqueueOp({ ...BASE, idempotencyKey: "b" });
		const c = await enqueueOp({ ...BASE, idempotencyKey: "c" });
		if (!a || !b || !c) throw new Error("enqueue failed");

		await markStatus(a.id, "synced");
		await markStatus(b.id, "synced");
		await markStatus(c.id, "failed", "nope");

		const removed = await clearSynced();
		expect(removed).toBe(2);

		const remaining = await listOps();
		expect(remaining.map((o) => o.id)).toEqual([c.id]);
	});
});
