import { usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// No baseURL deliberately, so auth calls stay on the origin the page was
// served from.
// A pinned origin makes every call from a game subdomain
// cross-origin, and the better-auth handler sends no CORS headers.
const authClient = createAuthClient({
	// Mirrors the plugins in auth.ts.
	// Declared explicitly so the client never type-depends
	// on the server module and everything it pulls in.
	plugins: [usernameClient()],
});

const { signIn, signUp, signOut, useSession, resetPassword } = authClient;

export { authClient, resetPassword, signIn, signOut, signUp, useSession };
