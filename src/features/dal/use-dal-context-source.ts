// Provides a stable getter for the current DalContext.
// The getter pattern defers backend evaluation to query/mutation execution time,
// not hook creation time, so stale context from a previous render is never used.

import { useNetwork } from "@mantine/hooks";
import { useRef } from "react";
import { chooseBackend } from "#/features/dal/choose-backend.ts";
import { getOrCreateAnonUserId } from "#/features/dal/identity/anon-id.ts";
import type { DalContext } from "#/features/dal/types.ts";
import { useSession } from "#/integrations/better-auth/auth-client.ts";

/** A function that returns the current DalContext when called. */
type DalContextGetter = () => DalContext;

/**
 * Returns a memoized DalContextGetter.
 *
 * The ref is updated on every render with the latest auth/network state, but the
 * returned getter function has a stable identity. Hooks that capture the getter
 * (e.g. useMutation's mutationFn) will always read the latest context when they
 * execute, even if the auth state changed since the hook was first mounted.
 */
const useDalContextSource = (): DalContextGetter => {
	const { data } = useSession();

	const { online } = useNetwork();
	const sourceRef = useRef<DalContext>({
		anonUserId: "",
		authUserId: null,
		backend: "local",
	});

	sourceRef.current = {
		anonUserId: getOrCreateAnonUserId(),
		authUserId: data?.user?.id ?? null,
		backend: chooseBackend({ authed: !!data?.user?.id, online }),
	};

	return () => sourceRef.current;
};

export { type DalContextGetter, useDalContextSource };
