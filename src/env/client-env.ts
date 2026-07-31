import { z } from "zod";

const clientEnvSchema = z.object({
	VITE_APP_NAME: z.string(),
	VITE_APP_DESCRIPTION: z.string(),
	VITE_APP_URL: z.url(),
	VITE_APP_NOREPLY_EMAIL: z.email(),
	VITE_CLOUDFRONT_URL: z.url(),
	VITE_LOCAL_ADMIN_EMAIL: z.email(),
	VITE_LOCAL_ADMIN_PASSWORD: z.string(),
	VITE_LOCAL_USER_EMAIL: z.email(),
	VITE_LOCAL_USER_PASSWORD: z.string(),
	VITE_ENABLE_MAINTENANCE_MODE: z.boolean(),
	VITE_SHOW_COMING_SOON: z.boolean(),
});

// Vite replaces `import.meta.env` at build time, but plain Node processes that
// import this module (e.g. `prisma/seed.ts` via tsx) only have `process.env`.
const clientEnvSource =
	typeof import.meta.env === "undefined" ? process.env : import.meta.env;

// Validate client environment
export const clientEnv = clientEnvSchema.parse(clientEnvSource);
