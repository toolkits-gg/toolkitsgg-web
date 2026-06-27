import { describe, expect, it, vi } from "vitest";
import type { PendingOp } from "#/features/sync/queue/types.ts";
import { createRecordSyncHandler } from "#/features/sync/record-sync-handler.ts";

const T1 = "2026-01-01T00:00:00.000Z";
const T2 = "2026-01-02T00:00:00.000Z";
const T3 = "2026-01-03T00:00:00.000Z";

const makeOp = (over: Partial<PendingOp>): PendingOp => ({
	id: "op1",
	createdAt: T2,
	updatedAt: T2,
	anonUserId: "anon",
	entity: "thing",
	operation: "upsert",
	payload: { id: "r1", name: "Local" },
	idempotencyKey: "k",
	status: "pending",
	serverUpdatedAt: T1,
	...over,
});

const makeDeps = (record: { updatedAt: string } | null) => ({
	resolveKey: (op: { payload: unknown }) => ({
		ok: true as const,
		key: (op.payload as { id: string }).id,
	}),
	findRecord: vi.fn(async () => record),
	createRecord: vi.fn(async () => {}),
	updateRecord: vi.fn(async () => {}),
	deleteRecord: vi.fn(async () => {}),
});

describe("createRecordSyncHandler", () => {
	it("creates when no server record exists", async () => {
		const deps = makeDeps(null);
		const handler = createRecordSyncHandler(deps);
		const result = await handler(makeOp({ operation: "create" }), "u1");
		expect(result).toEqual({ status: "applied" });
		expect(deps.createRecord).toHaveBeenCalledWith("u1", "r1", {
			id: "r1",
			name: "Local",
		});
		expect(deps.updateRecord).not.toHaveBeenCalled();
	});

	it("updates the record from payload when local wins", async () => {
		const deps = makeDeps({ updatedAt: T1 }); // server == baseline -> equal? no: baseline T1, server T1 => equal
		const handler = createRecordSyncHandler(deps);
		// Make server behind baseline so it resolves to local-wins -> update.
		const result = await handler(
			makeOp({ operation: "update", serverUpdatedAt: T2 }),
			"u1",
		);
		expect(result).toEqual({ status: "applied" });
		expect(deps.updateRecord).toHaveBeenCalledWith("u1", "r1", {
			id: "r1",
			name: "Local",
		});
	});

	it("noops an update when the server matches the baseline (already synced)", async () => {
		const deps = makeDeps({ updatedAt: T1 });
		const handler = createRecordSyncHandler(deps);
		const result = await handler(
			makeOp({ operation: "upsert", serverUpdatedAt: T1 }),
			"u1",
		);
		expect(result).toEqual({ status: "noop" });
		expect(deps.updateRecord).not.toHaveBeenCalled();
	});

	it("reports a conflict when the server advanced past the baseline", async () => {
		const deps = makeDeps({ updatedAt: T3 });
		const handler = createRecordSyncHandler(deps);
		const result = await handler(
			makeOp({ operation: "update", serverUpdatedAt: T1 }),
			"u1",
		);
		expect(result.status).toBe("conflict");
		if (result.status === "conflict") {
			expect(JSON.parse(result.serverRecordJson)).toEqual({ updatedAt: T3 });
		}
		expect(deps.updateRecord).not.toHaveBeenCalled();
	});

	it("force-applies an update despite a server conflict", async () => {
		const deps = makeDeps({ updatedAt: T3 });
		const handler = createRecordSyncHandler(deps);
		const result = await handler(
			makeOp({ operation: "update", serverUpdatedAt: T1 }),
			"u1",
			{ force: true },
		);
		expect(result).toEqual({ status: "applied" });
		expect(deps.updateRecord).toHaveBeenCalled();
	});

	it("noops a delete when the record is already absent", async () => {
		const deps = makeDeps(null);
		const handler = createRecordSyncHandler(deps);
		const result = await handler(makeOp({ operation: "delete" }), "u1");
		expect(result).toEqual({ status: "noop" });
		expect(deps.deleteRecord).not.toHaveBeenCalled();
	});

	it("deletes when present and local wins", async () => {
		const deps = makeDeps({ updatedAt: T1 });
		const handler = createRecordSyncHandler(deps);
		const result = await handler(
			makeOp({ operation: "delete", serverUpdatedAt: T1 }),
			"u1",
		);
		expect(result).toEqual({ status: "applied" });
		expect(deps.deleteRecord).toHaveBeenCalledWith("u1", "r1");
	});

	it("conflicts on delete when the server advanced past the baseline", async () => {
		const deps = makeDeps({ updatedAt: T3 });
		const handler = createRecordSyncHandler(deps);
		const result = await handler(
			makeOp({ operation: "delete", serverUpdatedAt: T1 }),
			"u1",
		);
		expect(result.status).toBe("conflict");
		expect(deps.deleteRecord).not.toHaveBeenCalled();
	});

	it("returns an error when the key cannot be resolved", async () => {
		const deps = makeDeps(null);
		const handler = createRecordSyncHandler({
			...deps,
			resolveKey: () => ({ ok: false, message: "missing id" }),
		});
		const result = await handler(makeOp({}), "u1");
		expect(result).toEqual({ status: "error", message: "missing id" });
	});
});
