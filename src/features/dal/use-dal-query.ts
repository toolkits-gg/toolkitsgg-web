import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { toQueryOptions } from "#/features/dal/to-query-options.ts";
import type { DalReadAction } from "#/features/dal/types.ts";
import { useDalContextSource } from "#/features/dal/use-dal-context-source.ts";

/**
 * Executes a DAL read action via TanStack Query.
 * The context getter ensures the backend (remote vs local) is chosen at query execution time.
 */
const useDalQuery = <Input, Output>(
	action: DalReadAction<Input, Output>,
	input: Input,
) => {
	const ctxGetter = useDalContextSource();
	return useQuery(toQueryOptions(action, input, ctxGetter));
};

/** Suspense-enabled variant of useDalQuery. */
const useDalSuspenseQuery = <Input, Output>(
	action: DalReadAction<Input, Output>,
	input: Input,
) => {
	const ctxGetter = useDalContextSource();
	return useSuspenseQuery(toQueryOptions(action, input, ctxGetter));
};

export { useDalQuery, useDalSuspenseQuery };
