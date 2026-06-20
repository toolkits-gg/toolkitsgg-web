// React hook wrapping useMutation with DAL backend dispatch and op enqueueing.

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueOp } from "#/features/dal/queue/pending-ops.ts";
import type { DalContext, DalWriteAction } from "#/features/dal/types.ts";
import { useDalContextSource } from "#/features/dal/use-dal-context-source.ts";

/** The value returned by a resolved useDalMutation call. */
interface UseDalMutationResult<Output> {
	result: Output;
	/** Which execution path ran: "remote" (direct server call) or "local" (IndexedDB + queued). */
	branch: "remote" | "local";
	/** The queued op's ID when branch is "local"; null on the remote path. */
	enqueuedOpId: string | null;
}

/**
 * Wraps useMutation with DAL backend selection:
 * - "remote" path: calls action.remote() directly, no queue involved.
 * - "local" path: calls action.local() for optimistic UI, then enqueues the op for later sync.
 * On success, invalidates TanStack Query caches for the primary entity and any additional invalidates.
 */
const useDalMutation = <Input, Output>(
	action: DalWriteAction<Input, Output>,
) => {
	const ctxGetter = useDalContextSource();
	const queryClient = useQueryClient();

	return useMutation<UseDalMutationResult<Output>, Error, Input>({
		mutationKey: ["dal", action.entity, action.operation],
		mutationFn: async (input: Input) => {
			const ctx = ctxGetter();
			if (ctx.backend === "remote") {
				const result = await action.remote(input, ctx);
				return { result, branch: "remote", enqueuedOpId: null };
			}
			return runLocalWithEnqueue(action, input, ctx);
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["dal", action.entity] }),
				...action.invalidates.map((entity) =>
					queryClient.invalidateQueries({ queryKey: ["dal", entity] }),
				),
			]);
		},
	});
};

/**
 * Executes the local write and enqueues the op for sync.
 * `getServerUpdatedAt` runs first because it reads the pre-write `updatedAt` baseline
 * from the same prisma-idb record that `action.local` mutates — racing them would lose
 * the baseline. `action.local` and `enqueueOp` target separate IndexedDB databases and
 * share no data, so they race in parallel.
 */
const runLocalWithEnqueue = async <Input, Output>(
	action: DalWriteAction<Input, Output>,
	input: Input,
	ctx: DalContext,
): Promise<UseDalMutationResult<Output>> => {
	const serverUpdatedAt = action.getServerUpdatedAt
		? await action.getServerUpdatedAt(input, ctx)
		: undefined;
	const [result, op] = await Promise.all([
		action.local(input, ctx),
		enqueueOp({
			anonUserId: ctx.anonUserId,
			entity: action.entity,
			operation: action.operation,
			payload: input,
			idempotencyKey: action.buildIdempotencyKey(input, ctx),
			serverUpdatedAt: serverUpdatedAt ?? undefined,
			summary: action.describe?.(input, ctx),
		}),
	]);
	return { result, branch: "local", enqueuedOpId: op?.id ?? null };
};

export { useDalMutation };
