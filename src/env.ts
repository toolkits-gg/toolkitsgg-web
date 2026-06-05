import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.url(),
	NODE_ENV: z.enum(["development", "production", "test"]),
	BETTER_AUTH_SECRET: z.string(),
	BETTER_AUTH_URL: z.url(),
	DISCORD_CLIENT_ID: z.string(),
	DISCORD_CLIENT_SECRET: z.string(),
	RESEND_KEY: z.string(),
});

// Validate server environment
export const serverEnv = envSchema.parse(process.env);
