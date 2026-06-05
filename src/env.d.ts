/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_APP_NAME: string;
	readonly VITE_APP_URL: string;
	readonly VITE_CLOUDFRONT_URL: string;
	readonly VITE_LOCAL_ADMIN_EMAIL: string;
	readonly VITE_LOCAL_ADMIN_PASSWORD: string;
	readonly VITE_LOCAL_USER_EMAIL: string;
	readonly VITE_LOCAL_USER_PASSWORD: string;
}

// biome-ignore lint/correctness/noUnusedVariables: <Here for type safety and clarity>
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
		}
	}
}

export {};
