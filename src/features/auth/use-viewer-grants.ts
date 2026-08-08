import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { Capability, RoleGrant } from "#/features/auth/capabilities";
import { hasCapability } from "#/features/auth/capabilities";
import { listViewerGrantsServerFn } from "#/features/auth/roles";
import { useSession } from "#/integrations/better-auth/auth-client";
import type { GameId } from "@/prisma";

const EMPTY: RoleGrant[] = [];

/**
 * The viewer's role grants, plus a `can()` built on the same matrix the server
 * enforces with. This drives what the UI offers; it is not the security
 * boundary - every privileged server fn re-checks independently.
 */
const useViewerGrants = () => {
	const { data: session, isPending: sessionPending } = useSession();
	const isAuthed = Boolean(session?.user);

	const { data, isPending } = useQuery({
		queryKey: ["data", "viewerGrants", session?.user?.id ?? "guest"],
		queryFn: (): Promise<RoleGrant[]> => listViewerGrantsServerFn(),
		enabled: isAuthed,
	});

	const grants = data ?? EMPTY;

	return useMemo(
		() => ({
			grants,
			isLoading: sessionPending || (isAuthed && isPending),
			hasAnyRole: grants.length > 0,
			can: (capability: Capability, gameId: GameId) =>
				hasCapability(grants, capability, gameId),
		}),
		[grants, isAuthed, isPending, sessionPending],
	);
};

export { useViewerGrants };
