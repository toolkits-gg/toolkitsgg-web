import { useNetwork } from "@mantine/hooks";
import { chooseBackend } from "#/features/dal/core/choose-backend";
import type { Backend } from "#/features/dal/core/types";
import { useSession } from "#/integrations/better-auth/auth-client";

/** Convenience hook — reads auth session and network state and returns the current backend. */
const useBackend = (): Backend => {
	const { data } = useSession();
	const { online } = useNetwork();
	return chooseBackend({ authed: !!data?.user?.id, online });
};

export { useBackend };
