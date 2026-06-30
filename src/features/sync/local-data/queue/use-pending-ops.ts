import { useQuery } from "@tanstack/react-query";
import { listOps } from "#/features/sync/local-data/queue/pending-ops.ts";
import type {
	ListOpsFilter,
	PendingOp,
} from "#/features/sync/local-data/queue/types.ts";

/**
 * Returns pending ops from IndexedDB, optionally filtered by status or entity.
 * `refetchOnWindowFocus` is disabled because queue changes are driven by explicit
 * mutations; background polling would show stale intermediate states during sync.
 */
const usePendingOps = (filter?: ListOpsFilter) => {
	return useQuery<PendingOp[]>({
		queryKey: ["sync-queue", filter?.status ?? "all", filter?.entity ?? "all"],
		queryFn: () => listOps(filter),
		refetchOnWindowFocus: false,
	});
};

export { usePendingOps };
