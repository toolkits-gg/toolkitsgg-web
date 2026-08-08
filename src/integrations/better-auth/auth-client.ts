import { usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { clientEnv } from "#/env/client-env";

const authClient = createAuthClient({
	baseURL: clientEnv.VITE_APP_URL || "http://localhost:3000",
	// Mirrors the plugins in auth.ts.
	// Declared explicitly so the client never type-depends
	// on the server module and everything it pulls in.
	plugins: [usernameClient()],
});

const { signIn, signUp, signOut, useSession, resetPassword } = authClient;

export { authClient, resetPassword, signIn, signOut, signUp, useSession };
