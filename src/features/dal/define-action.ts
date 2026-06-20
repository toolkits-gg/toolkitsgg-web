// Factory helpers that stamp the `kind` discriminator on action configs.
// Using these ensures callers never set `kind` manually and TypeScript can
// narrow DalAction to DalReadAction or DalWriteAction via the discriminant.

import type { DalReadAction, DalWriteAction } from "#/features/dal/types.ts";

/** Creates a DalReadAction with the `kind: "read"` discriminator. */
const defineDalRead = <Input, Output>(
	config: Omit<DalReadAction<Input, Output>, "kind">,
): DalReadAction<Input, Output> => {
	return { kind: "read", ...config };
};

/** Creates a DalWriteAction with the `kind: "write"` discriminator. */
const defineDalWrite = <Input, Output>(
	config: Omit<DalWriteAction<Input, Output>, "kind">,
): DalWriteAction<Input, Output> => {
	return { kind: "write", ...config };
};

export { defineDalRead, defineDalWrite };
