import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { EmailPasswordReset } from "#/emails/auth/email-password-reset.tsx";
import { EmailVerification } from "#/emails/auth/email-verification.tsx";
import { clientEnv } from "#/env/client-env.ts";
import { serverEnv } from "#/env/server-env.ts";
import { getNoReplyFrom } from "#/features/email/utils.ts";
import { resend } from "#/integrations/resend/resend";
import { prisma } from "@/prisma";

const FROM = getNoReplyFrom();

const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	secret: serverEnv.BETTER_AUTH_SECRET,
	baseURL:
		serverEnv.BETTER_AUTH_URL ||
		clientEnv.VITE_APP_URL ||
		"http://localhost:3000",
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		async sendResetPassword({ user, url }) {
			await resend.emails.send({
				from: FROM,
				to: user.email,
				subject: "Reset your password",
				react: EmailPasswordReset({
					toName: user.name || user.email,
					url,
				}),
			});
		},
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		async sendVerificationEmail({ user, url }) {
			await resend.emails.send({
				from: FROM,
				to: user.email,
				subject: "Verify your email address",
				react: EmailVerification({
					toName: user.name || user.email,
					url,
				}),
			});
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 30, // 30 days
		updateAge: 60 * 60 * 24 * 15, // 15 days - refresh session
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // 5 minutes
		},
	},
	rateLimit: {
		window: 60, // default window, in seconds
		max: 100, // default requests per window per IP
		storage: "memory",
		customRules: {
			"/sign-in/email": { window: 60, max: 10 },
			"/sign-up/email": { window: 60, max: 5 },
			"/forget-password": { window: 60, max: 3 },
			"/reset-password": { window: 60, max: 5 },
			"/send-verification-email": { window: 60, max: 3 },
		},
	},
	user: {
		additionalFields: {
			username: {
				type: "string",
				required: true,
				unique: true,
			},
		},
	},
	socialProviders: {
		discord: {
			clientId: serverEnv.DISCORD_CLIENT_ID,
			clientSecret: serverEnv.DISCORD_CLIENT_SECRET,
			mapProfileToUser: (profile) => {
				// Discord provides a username field - use it as the default username
				// Better Auth will handle uniqueness by appending numbers if needed
				return {
					name: profile.username || profile.global_name || undefined,
					image: profile.avatar
						? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
						: undefined,
					email: profile.email,
					emailVerified: profile.verified ?? false,
					username:
						profile.username || profile.global_name || `discord_${profile.id}`,
				};
			},
		},
	},
	plugins: [nextCookies()],
});

type Auth = typeof auth;

export { type Auth, auth };
