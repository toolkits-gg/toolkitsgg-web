import { z } from "zod";

const clientEnvSchema = z.object({
	VITE_APP_NAME: z.string(),
	VITE_APP_URL: z.url(),
	VITE_APP_NOREPLY_EMAIL: z.email(),
	VITE_CLOUDFRONT_URL: z.url(),
	VITE_LOCAL_ADMIN_EMAIL: z.email(),
	VITE_LOCAL_ADMIN_PASSWORD: z.string(),
	VITE_LOCAL_USER_EMAIL: z.email(),
	VITE_LOCAL_USER_PASSWORD: z.string(),
});

// Validate client environment (build-time, always safe)
export const clientEnv = clientEnvSchema.parse(import.meta.env);
