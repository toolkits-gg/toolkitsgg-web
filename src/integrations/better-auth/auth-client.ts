import { createAuthClient } from "better-auth/react";
import { clientEnv } from "#/env/client-env.ts";

const authClient = createAuthClient({
	baseURL: clientEnv.VITE_APP_URL || "http://localhost:3000",
});

// noinspection JSUnusedGlobalSymbols
const { signIn, signUp, signOut, useSession, resetPassword, verifyEmail } =
	authClient;

// noinspection JSUnusedGlobalSymbols
const signInWithDiscord = async () => {
	await authClient.signIn.social({
		provider: "discord",
	});
};

export {
	authClient,
	resetPassword,
	signIn,
	signInWithDiscord,
	signOut,
	signUp,
	useSession,
	verifyEmail,
};
