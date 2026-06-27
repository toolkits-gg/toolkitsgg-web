// Resolves the active user identity across user and anon states.

import { useEffect, useState } from "react";
import { getOrCreateAnonUserId } from "#/features/sync/identity/anon-id";
import { useSession } from "#/integrations/better-auth/auth-client";

type EffectiveUserId = {
	id: string;
	/**
	 * - `"user"` — user is logged in; id is the Better Auth user ID.
	 * - `"anon"` — user is not logged in but has a persistent anon ID from localStorage.
	 * - `"none"` — transitional state on first render before the anon ID is initialized (SSR).
	 */
	kind: "auth" | "anon" | "none";
};

/**
 * Returns the most specific available user identity.
 *
 * The anon ID is initialized inside useEffect because localStorage is unavailable
 * during SSR. When `authId` becomes available (after login), the anon ID is cleared
 * to prevent it from being reused after the user has authenticated.
 */
const useEffectiveUserId = (): EffectiveUserId => {
	const { data } = useSession();
	const authId = data?.user?.id ?? null;
	const [anonId, setAnonId] = useState<string | null>(null);

	useEffect(() => {
		if (!authId) {
			setAnonId(getOrCreateAnonUserId());
		} else {
			setAnonId(null);
		}
	}, [authId]);

	if (authId) return { id: authId, kind: "auth" };
	if (anonId) return { id: anonId, kind: "anon" };
	return { id: "", kind: "none" };
};

export { useEffectiveUserId };
