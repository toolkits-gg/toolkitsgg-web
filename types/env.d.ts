/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_APP_NAME: string;
	readonly VITE_APP_DESCRIPTION: string;
	readonly VITE_APP_URL: string;
	readonly VITE_APP_NOREPLY_EMAIL: string;
	readonly VITE_CLOUDFRONT_URL: string;
}

// biome-ignore lint/correctness/noUnusedVariables: <here for type safety and clarity>
interface ImportMeta {
	readonly env: ImportMetaEnv;
}

// Server-side environment variables
declare global {
	namespace NodeJS {
		interface ProcessEnv {
			readonly DATABASE_URL: string;
			readonly BETTER_AUTH_SECRET: string;
			readonly BETTER_AUTH_URL: string;
			readonly NODE_ENV: "development" | "production" | "test";
			readonly DISCORD_CLIENT_ID: string;
			readonly DISCORD_CLIENT_SECRET: string;
			readonly REDDIT_CLIENT_ID: string;
			readonly REDDIT_CLIENT_SECRET: string;
			readonly RESEND_KEY: string;
			// Credentials for the site's super admin. Every environment must set
			// these: `seedReferenceData()` guarantees the account exists and holds a
			// global SUPERADMIN role.
			readonly SUPER_ADMIN_EMAIL: string;
			readonly SUPER_ADMIN_PASSWORD: string;
			// Seed-only fixtures, loaded from `.env.local` by `prisma/seed-reset.ts`.
			// Never set in production/preview, so they are optional.
			readonly LOCAL_USER_EMAIL?: string;
			readonly LOCAL_USER_PASSWORD?: string;
			readonly LOCAL_MODERATOR_EMAIL?: string;
			readonly LOCAL_MODERATOR_PASSWORD?: string;
		}
	}
}

export {};
