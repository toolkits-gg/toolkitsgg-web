import { z } from "zod";

/**
 * Shared by the better-auth `username()` plugin config and the sign-up form so
 * the two cannot drift. The plugin normalizes `username` to lowercase and keeps
 * the original casing in `displayUsername`, so these rules describe what the
 * user is allowed to type, not what gets stored.
 */
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 30;
const USERNAME_PATTERN = /^[a-zA-Z0-9_.]+$/;
const USERNAME_DISALLOWED_CHARS = /[^a-zA-Z0-9_.]/g;

const isValidUsername = (username: string) => USERNAME_PATTERN.test(username);

const usernameSchema = z
	.string()
	.trim()
	.min(1, "Username is required")
	.min(
		USERNAME_MIN_LENGTH,
		`Username must be at least ${USERNAME_MIN_LENGTH} characters`,
	)
	.max(
		USERNAME_MAX_LENGTH,
		`Username must be at most ${USERNAME_MAX_LENGTH} characters`,
	)
	.regex(
		USERNAME_PATTERN,
		"Username can only contain letters, numbers, underscores, and periods",
	);

export {
	isValidUsername,
	USERNAME_DISALLOWED_CHARS,
	USERNAME_MAX_LENGTH,
	USERNAME_MIN_LENGTH,
	usernameSchema,
};
