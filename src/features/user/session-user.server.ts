import { getRequest } from "@tanstack/react-start/server";
import { auth } from "#/integrations/better-auth/auth";

type SessionUser = {
	id: string;
	email: string;
	emailVerified: boolean;
};

/**
 * The signed-in user, read on the server so a route can gate on it during SSR.
 *
 * The `useSession()` store cannot do this job: it is a module-level nanostore
 * that fetches on its first subscriber, so on a full page load the always-mounted
 * root components resolve it before a lazy route chunk hydrates. A route that
 * branches its whole tree on `isPending` then renders a loader on the server and
 * the real page on the client, which is a hydration mismatch.
 */
const getSessionUser = async (): Promise<SessionUser | null> => {
	const session = await auth.api.getSession({ headers: getRequest().headers });
	const user = session?.user;
	if (!user) return null;
	return {
		id: user.id,
		email: user.email,
		emailVerified: user.emailVerified,
	};
};

export type { SessionUser };
export { getSessionUser };
