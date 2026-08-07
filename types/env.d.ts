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
			readonly RESEND_KEY: string;
			// Seed-only credentials, loaded from `.env.local` by `prisma/seed.ts`.
			// Never set in production/preview, so they are optional.
			readonly LOCAL_ADMIN_EMAIL?: string;
			readonly LOCAL_ADMIN_PASSWORD?: string;
			readonly LOCAL_USER_EMAIL?: string;
			readonly LOCAL_USER_PASSWORD?: string;
		}
	}
}

export {};
