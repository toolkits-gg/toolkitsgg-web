/**
 * Orchestrates syncing a batch of pending ops to the server sequentially.
 */
import { applyPendingOpServerFn } from "#/features/sync/apply-pending-ops";
import { deleteOp, markStatus } from "#/features/sync/queue/pending-ops";
import type { PendingOp } from "#/features/sync/queue/types";
import type { SyncResult } from "#/features/sync/types";

interface SyncAllOptions {
	/** Called before each op is processed - use to drive UI progress indicators. */
	onProgress?: (op: PendingOp, index: number, total: number) => void;
	/**
	 * Abandon the run after the first error instead of attempting the rest.
	 *
	 * Ops depend on each other only through FIFO ordering - there is no dependency
	 * graph - so once one fails, every later op that needed it fails too, with a
	 * misleading message (a membership add whose collection never landed reports
	 * "Collection not found or not owned by user"). Stopping leaves them `pending`
	 * and retryable in order. The manual data-sync screen leaves this off so a
	 * user working through a queue still sees every independent op attempted.
	 */
	stopOnError?: boolean;
}

/** Summary of a completed sync run. */
interface SyncAllReport {
	/** Ops successfully written to the server. */
	applied: number;
	/** Ops discarded because the server record had already moved past them. */
	superseded: number;
	/** Ops that were already reflected on the server (deleted from the queue). */
	noops: number;
	/** Ops that failed due to a network error or handler exception. */
	errors: number;
	/** Ops left untouched because `stopOnError` ended the run early. */
	skipped: number;
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
	const report = emptyReport();
	for (let index = 0; index < ops.length; index += 1) {
		const op = ops[index];
		options?.onProgress?.(op, index, ops.length);
		const result = await runOnce(op);
		await applyResult(op.id, result, report);
		if (options?.stopOnError && result.status === "error") {
			report.skipped = ops.length - index - 1;
			break;
		}
	}
	return report;
};

const emptyReport = (): SyncAllReport => ({
	applied: 0,
	superseded: 0,
	noops: 0,
	errors: 0,
	skipped: 0,
});

const runOnce = async (op: PendingOp): Promise<SyncResult> => {
	await markStatus(op.id, "syncing");
	try {
		return await applyPendingOpServerFn({ data: { op } });
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
		// Dropped rather than kept: the server record already moved past this op,
		// so there is nothing left for it to write and nobody to reconcile it.
		case "superseded":
			report.superseded += 1;
			await deleteOp(opId);
			break;
		case "error":
			report.errors += 1;
			await markStatus(opId, "failed", result.message);
			break;
		// The result crosses a server boundary and a persisted dedupe cache, so it can
		// carry a shape this build does not know. Failing keeps the op retryable;
		// falling through would strand it in "syncing", where the queue's dedupe would
		// also swallow the user's next equivalent write.
		default:
			report.errors += 1;
			await markStatus(opId, "failed", "Unrecognized sync result.");
			break;
	}
};

export type { SyncAllReport };
export { syncOps };
