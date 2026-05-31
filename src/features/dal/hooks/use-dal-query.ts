import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { toQueryOptions } from "#/features/dal/core/to-query-options";
import type { DalReadAction } from "#/features/dal/core/types";
import { useDalContextSource } from "#/features/dal/hooks/use-dal-context-source";

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
