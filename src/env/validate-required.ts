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
	"VITE_APP_DESCRIPTION",
	"VITE_APP_URL",
	"VITE_APP_NOREPLY_EMAIL",
	"VITE_CLOUDFRONT_URL",
	"VITE_LOCAL_ADMIN_EMAIL",
	"VITE_LOCAL_ADMIN_PASSWORD",
	"VITE_LOCAL_USER_EMAIL",
	"VITE_LOCAL_USER_PASSWORD",
	"VITE_ENABLE_MAINTENANCE_MODE",
	"VITE_SHOW_COMING_SOON",
] as const;

// Validate on created-builds startup
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
