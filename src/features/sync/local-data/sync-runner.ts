/**
 * Orchestrates syncing a batch of pending ops to the server sequentially.
 */
import { applyPendingOpServerFn } from "#/features/sync/local-data/apply-pending-ops.ts";
import {
	deleteOp,
	markConflict,
	markStatus,
} from "#/features/sync/local-data/queue/pending-ops.ts";
import type { PendingOp } from "#/features/sync/local-data/queue/types.ts";
import type { SyncResult } from "#/features/sync/local-data/types.ts";

interface SyncAllOptions {
	/** Called before each op is processed — use to drive UI progress indicators. */
	onProgress?: (op: PendingOp, index: number, total: number) => void;
}

/** Summary of a completed sync run. */
interface SyncAllReport {
	/** Ops successfully written to the server. */
	applied: number;
	/** Ops where the server record was newer; user reconciliation required. */
	conflicts: number;
	/** Ops that were already reflected on the server (deleted from the queue). */
	noops: number;
	/** Ops that failed due to a network error or handler exception. */
	errors: number;
}

/**
 * Processes each op sequentially (not in parallel) to preserve causal ordering.
 * Parallel execution could allow a delete to race an upsert for the same entity,
 * producing inconsistent server state.
 */
const syncOps = async (
	ops: PendingOp[],
	options?: SyncAllOptions,
): Promise<SyncAllReport> => {
	const report: SyncAllReport = {
		applied: 0,
		conflicts: 0,
		noops: 0,
		errors: 0,
	};
	for (let index = 0; index < ops.length; index += 1) {
		const op = ops[index];
		options?.onProgress?.(op, index, ops.length);
		const result = await runOnce(op);
		await applyResult(op.id, result, report);
	}
	return report;
};

/**
 * Re-attempts a single op with `force: true`, which asks the sync handler to
 * skip its LWW check. Intended for the "Keep mine" path from the data-sync UI
 * after a previous attempt produced a conflict.
 */
const forceSyncOp = async (op: PendingOp): Promise<SyncResult> => {
	const result = await runOnce(op, { force: true });
	const report: SyncAllReport = {
		applied: 0,
		conflicts: 0,
		noops: 0,
		errors: 0,
	};
	await applyResult(op.id, result, report);
	return result;
};

const runOnce = async (
	op: PendingOp,
	options?: { force?: boolean },
): Promise<SyncResult> => {
	await markStatus(op.id, "syncing");
	try {
		return await applyPendingOpServerFn({
			data: { op, force: options?.force },
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return { status: "error", message };
	}
};

const applyResult = async (
	opId: string,
	result: SyncResult,
	report: SyncAllReport,
): Promise<void> => {
	switch (result.status) {
		case "applied":
			report.applied += 1;
			await markStatus(opId, "synced");
			break;
		case "noop":
			report.noops += 1;
			await deleteOp(opId);
			break;
		case "conflict":
			report.conflicts += 1;
			await markConflict(opId, result.serverRecordJson);
			break;
		case "error":
			report.errors += 1;
			await markStatus(opId, "failed", result.message);
			break;
	}
};

export { forceSyncOp, syncOps };
