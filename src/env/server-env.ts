import { z } from "zod";

const serverEnvSchema = z.object({
	DATABASE_URL: z.url(),
	NODE_ENV: z.enum(["development", "production", "test"]),
	BETTER_AUTH_SECRET: z.string(),
	BETTER_AUTH_URL: z.url(),
	DISCORD_CLIENT_ID: z.string(),
	DISCORD_CLIENT_SECRET: z.string(),
	REDDIT_CLIENT_ID: z.string(),
	REDDIT_CLIENT_SECRET: z.string(),
	RESEND_KEY: z.string(),
	SUPER_ADMIN_EMAIL: z.email(),
	SUPER_ADMIN_PASSWORD: z.string().min(8),
});

// Validate server environment
const serverEnv = serverEnvSchema.parse(process.env);

export { serverEnv };
