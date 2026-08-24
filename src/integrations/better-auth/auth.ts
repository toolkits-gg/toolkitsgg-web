import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username as usernamePlugin } from "better-auth/plugins";
import { APP_DOMAIN } from "#/constants";
import { ChangeConfirmationEmail } from "#/emails/ChangeConfirmationEmail.tsx";
import { EmailVerificationEmail } from "#/emails/EmailVerificationEmail.tsx";
import { PasswordChangedEmail } from "#/emails/PasswordChangedEmail.tsx";
import { PasswordResetEmail } from "#/emails/PasswordResetEmail.tsx";
import { WelcomeEmail } from "#/emails/WelcomeEmail.tsx";
import { clientEnv } from "#/env/client-env";
import { serverEnv } from "#/env/server-env";
import { sendEmail } from "#/features/email/send-email";
import {
	isValidUsername,
	USERNAME_DISALLOWED_CHARS,
	USERNAME_MAX_LENGTH,
	USERNAME_MIN_LENGTH,
} from "#/features/user/username-rules";
import { prisma } from "@/prisma";

const appUrl = clientEnv.VITE_APP_URL;

const displayName = (user: { name?: string | null; email: string }) =>
	user.name || user.email;

/**
 * Discord handles can contain characters the username plugin rejects, and
 * global_name is free-form, so a candidate has to be coerced into the allowed
 * shape before it can be probed for availability. Truncated short of the max so
 * a collision suffix still fits.
 */
const SUFFIX_HEADROOM = 4;

const toUsernameCandidate = (value: string) => {
	const stripped = value
		.toLowerCase()
		.replace(USERNAME_DISALLOWED_CHARS, "")
		.slice(0, USERNAME_MAX_LENGTH - SUFFIX_HEADROOM);
	return stripped.length >= USERNAME_MIN_LENGTH ? stripped : null;
};

/**
 * The username plugin rejects a taken handle rather than renaming it, which
 * would abort Discord sign-up entirely. Probing here keeps the OAuth flow
 * succeeding; the plugin still has the final say on the value we hand it.
 */
const availableUsername = async (base: string) => {
	for (let attempt = 1; attempt <= 50; attempt++) {
		const candidate = attempt === 1 ? base : `${base}_${attempt}`;
		const taken = await prisma.user.findUnique({
			where: { username: candidate },
			select: { id: true },
		});
		if (!taken) return candidate;
	}
	return `${base}_${Date.now().toString(36)}`.slice(0, USERNAME_MAX_LENGTH);
};

const socialUsernameFields = async (args: {
	handle: string;
	providerId: string;
	accountId: string;
}) => {
	const { handle, providerId, accountId } = args;
	const fallback = `${providerId}_${accountId}`;
	const candidate =
		toUsernameCandidate(handle) ??
		toUsernameCandidate(fallback) ??
		fallback.slice(0, USERNAME_MAX_LENGTH);

	return {
		username: await availableUsername(candidate),
		displayUsername: handle || candidate,
	};
};

/**
 * afterEmailVerification also fires when an address change is confirmed, which
 * would re-send the welcome email to an existing user. Those tokens
 * carry an `updateTo` value, so reading the payload is enough to
 * tell the two apart.
 */
const isEmailChangeVerification = (request?: Request) => {
	if (!request) return false;
	const token = new URL(request.url).searchParams.get("token");
	const payload = token?.split(".")[1];
	if (!payload) return false;
	try {
		const claims = JSON.parse(
			Buffer.from(payload, "base64url").toString("utf8"),
		) as { updateTo?: string };
		return Boolean(claims.updateTo);
	} catch {
		return false;
	}
};

const VERIFY_EMAIL_PATH = "/verify-email";

const withVerifyEmailCallback = (url: string) => {
	const parsed = new URL(url);
	if (parsed.searchParams.get("callbackURL") !== "/") return url;
	parsed.searchParams.set("callbackURL", VERIFY_EMAIL_PATH);
	return parsed.toString();
};

const baseURL =
	serverEnv.BETTER_AUTH_URL ||
	clientEnv.VITE_APP_URL ||
	"http://localhost:3000";

// Games are served from their own subdomain, so the session cookie has to be
// readable across all of them. Only applied when the app really is on the app
// domain - a domain attribute pinned to toolkits.gg breaks cookies on localhost.
const isAppDomain = new URL(baseURL).hostname.endsWith(APP_DOMAIN);

const crossSubdomain = isAppDomain
	? {
			// Wildcard rather than a list built from the game registry
			trustedOrigins: [`https://${APP_DOMAIN}`, `https://*.${APP_DOMAIN}`],
			advanced: {
				crossSubDomainCookies: {
					enabled: true,
					domain: `.${APP_DOMAIN}`,
				},
			},
		}
	: {};

const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	secret: serverEnv.BETTER_AUTH_SECRET,
	baseURL,
	...crossSubdomain,
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		async sendResetPassword({ user, url }) {
			await sendEmail({
				to: user.email,
				subject: "Reset your password",
				template: "email-password-reset",
				react: PasswordResetEmail({ toName: displayName(user), url }),
			});
		},
		async onPasswordReset({ user }) {
			await sendEmail({
				to: user.email,
				subject: "Your password was changed",
				template: "email-password-changed",
				react: PasswordChangedEmail({
					toName: displayName(user),
					url: `${appUrl}/forgot-password`,
				}),
			});
		},
	},
	emailVerification: {
		sendOnSignUp: true,
		sendOnSignIn: true,
		autoSignInAfterVerification: true,
		async sendVerificationEmail({ user, url }) {
			await sendEmail({
				to: user.email,
				subject: "Verify your email address",
				template: "email-verification",
				react: EmailVerificationEmail({
					toName: displayName(user),
					url: withVerifyEmailCallback(url),
				}),
			});
		},
		async afterEmailVerification(user, request) {
			if (isEmailChangeVerification(request)) return;
			await sendEmail({
				to: user.email,
				subject: `Welcome to ${clientEnv.VITE_APP_NAME}`,
				template: "email-welcome",
				react: WelcomeEmail({ toName: displayName(user), url: appUrl }),
			});
		},
	},
	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					await prisma.userProfile.upsert({
						where: { userId: user.id },
						update: {},
						create: { userId: user.id },
					});
				},
			},
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 30, // 30 days
		updateAge: 60 * 60 * 24 * 15, // 15 days - refresh session
		// `/unlink-account` is the only endpoint that reads freshAge, and it
		// measures from Session.createdAt, which updateAge never moves. Left at the
		// one-day default nobody on a 30-day session could ever unlink. Losing the
		// last sign-in method is still blocked by better-auth itself.
		freshAge: 0,
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // 5 minutes
		},
	},
	account: {
		accountLinking: {
			enabled: true,
			// Reddit only. Trusting a provider lets it link on the strength of the
			// provider's say-so alone, and Reddit's synthesized `<id>@reddit.invalid`
			// can never collide with a real user's address. Discord is deliberately
			// absent: its emails are user-supplied, so trusting it would let an
			// unverified Discord account claim the Toolkits account of the same
			// address.
			trustedProviders: ["reddit"],
			// Required for Reddit, whose placeholder address never matches the
			// session's. Only consulted when linking an account to an already
			// signed-in user; sign-in still matches strictly on email.
			allowDifferentEmails: true,
		},
	},
	rateLimit: {
		window: 60, // default window, in seconds
		max: 100, // default requests per window per IP
		// Postgres rather than memory: serverless instances are ephemeral and
		// horizontally scaled, so a per-process counter never accumulates enough
		// to reach any of the limits below.
		storage: "database",
		modelName: "rateLimit",
		customRules: {
			"/sign-in/email": { window: 60, max: 10 },
			"/sign-up/email": { window: 60, max: 5 },
			"/request-password-reset": { window: 60, max: 3 },
			"/reset-password": { window: 60, max: 5 },
			"/send-verification-email": { window: 60, max: 3 },
			"/sign-in/social": { window: 60, max: 10 },
			"/link-social": { window: 60, max: 10 },
			"/unlink-account": { window: 60, max: 10 },
		},
	},
	plugins: [
		usernamePlugin({
			minUsernameLength: USERNAME_MIN_LENGTH,
			maxUsernameLength: USERNAME_MAX_LENGTH,
			usernameValidator: isValidUsername,
		}),
	],
	user: {
		changeEmail: {
			enabled: true,
			async sendChangeEmailConfirmation({ user, newEmail, url }) {
				await sendEmail({
					to: user.email,
					subject: "Confirm your new email address",
					template: "email-change-confirmation",
					react: ChangeConfirmationEmail({
						toName: displayName(user),
						newEmail,
						url,
					}),
				});
			},
		},
	},
	socialProviders: {
		discord: {
			clientId: serverEnv.DISCORD_CLIENT_ID,
			clientSecret: serverEnv.DISCORD_CLIENT_SECRET,
			mapProfileToUser: async (profile) => {
				const handle = profile.username || profile.global_name || "";
				const base = {
					name: handle || undefined,
					image: profile.avatar
						? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
						: undefined,
					email: profile.email,
					emailVerified: profile.verified ?? false,
				};

				// This also runs when an existing account signs in again, so an
				// established username must never be recomputed out from under them.
				const existing = profile.email
					? await prisma.user.findUnique({
							where: { email: profile.email },
							select: { id: true },
						})
					: null;
				if (existing) return base;

				return {
					...base,
					...(await socialUsernameFields({
						handle,
						providerId: "discord",
						accountId: profile.id,
					})),
				};
			},
		},
		reddit: {
			clientId: serverEnv.REDDIT_CLIENT_ID,
			clientSecret: serverEnv.REDDIT_CLIENT_SECRET,
			// Reddit's `identity` scope carries no email, so better-auth synthesizes
			// an unroutable `<id>@reddit.invalid` placeholder after this runs. A
			// returning user therefore cannot be recognized by email the way
			// Discord's is - the account row is the only stable handle on them.
			mapProfileToUser: async (profile) => {
				const base = { name: profile.name };

				const existing = await prisma.account.findUnique({
					where: {
						providerId_accountId: {
							providerId: "reddit",
							accountId: profile.id,
						},
					},
					select: { id: true },
				});
				if (existing) return base;

				return {
					...base,
					...(await socialUsernameFields({
						handle: profile.name,
						providerId: "reddit",
						accountId: profile.id,
					})),
				};
			},
		},
	},
});

type Auth = typeof auth;

export { type Auth, auth };
