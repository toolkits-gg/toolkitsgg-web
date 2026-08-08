import { createStore } from "#/features/local-db/idb-store";
import type {
	ListOpsFilter,
	PendingOp,
	PendingOpStatus,
} from "#/features/sync/queue/types";

/**
 * The queue rows are the wire shape the replay sends, re-validated server-side
 * with `z.string()` timestamps, so this store stamps ISO strings rather than the
 * `Date` objects the Prisma-mirroring stores use.
 */
const opsStore = createStore({
	name: "ops",
	keyPath: "id",
	indexes: ["createdAt", "entity", "status", "idempotencyKey"],
	timestamps: "iso",
});

/**
 * Input for enqueueOp. The `id` and `status` overrides exist for test seeding only;
 * normal callers should omit them to get an auto-generated UUID and "pending" status.
 */
type EnqueueInput = Omit<
	PendingOp,
	"id" | "createdAt" | "updatedAt" | "status"
> & {
	id?: string;
	status?: PendingOpStatus;
};

/** Stores a new pending op in IndexedDB. Returns null if IndexedDB is unavailable. */
const enqueueOp = async (input: EnqueueInput): Promise<PendingOp | null> => {
	if (typeof indexedDB === "undefined") return null;

	// Skip if an equivalent op is already waiting - prevents duplicates from rapid mutations.
	const existing = await opsStore.findUnique({
		where: { idempotencyKey: input.idempotencyKey },
	});
	if (
		existing &&
		(existing.status === "pending" || existing.status === "syncing")
	) {
		return existing;
	}

	return opsStore.create({
		data: {
			...input,
			id: input.id ?? crypto.randomUUID(),
			status: input.status ?? "pending",
		},
	});
};

/**
 * Returns all ops ordered by createdAt (FIFO).
 * FIFO ordering matters during sync - ops must be applied in the order they were created
 * to preserve causal relationships (e.g. create before delete).
 */
const listOps = async (filter?: ListOpsFilter): Promise<PendingOp[]> => {
	if (typeof indexedDB === "undefined") return [];
	return opsStore.findMany({ where: filter, orderBy: { createdAt: "asc" } });
};

/**
 * Updates an op's status and optionally its lastError.
 * `lastError` is preserved across transitions only when the new status is "failed";
 * any other transition clears it unless a new error string is explicitly provided.
 */
const markStatus = async (
	id: string,
	status: PendingOpStatus,
	lastError?: string,
): Promise<PendingOp | null> => {
	const existing = await opsStore.findUnique({ where: { id } });
	if (!existing) return null;
	return opsStore.update({
		where: { id },
		data: {
			status,
			lastError: lastError ?? (status === "failed" ? existing.lastError : null),
		},
	});
};

/** Permanently removes a single op. Used for noop results during sync. */
const deleteOp = async (id: string): Promise<void> =>
	opsStore.deleteMany({ where: { id } });

export { deleteOp, enqueueOp, listOps, markStatus };
