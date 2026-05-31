import { useQuery } from "@tanstack/react-query";
import { listOps } from "#/features/dal/queue/pending-ops";
import type { ListOpsFilter, PendingOp } from "#/features/dal/queue/types";

/**
 * Returns pending ops from IndexedDB, optionally filtered by status or entity.
 * `refetchOnWindowFocus` is disabled because queue changes are driven by explicit
 * mutations; background polling would show stale intermediate states during sync.
 */
const usePendingOps = (filter?: ListOpsFilter) => {
	return useQuery<PendingOp[]>({
		queryKey: ["dal-queue", filter?.status ?? "all", filter?.entity ?? "all"],
		queryFn: () => listOps(filter),
		refetchOnWindowFocus: false,
	});
};

export { usePendingOps };
