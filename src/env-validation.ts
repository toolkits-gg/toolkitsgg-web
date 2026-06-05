const requiredServerEnv = [
	"DATABASE_URL",
	"BETTER_AUTH_SECRET",
	"BETTER_AUTH_URL",
	"DISCORD_CLIENT_ID",
	"DISCORD_CLIENT_SECRET",
	"RESEND_KEY",
] as const;

const requiredClientEnv = [
	"VITE_APP_NAME",
	"VITE_APP_URL",
	"VITE_CLOUDFRONT_URL",
] as const;

// Validate on server startup
for (const key of requiredServerEnv) {
	if (!process.env[key]) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
}

// Validate client environment at build time
for (const key of requiredClientEnv) {
	if (!import.meta.env[key]) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
}
