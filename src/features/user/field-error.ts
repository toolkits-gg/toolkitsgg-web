/**
 * Normalizes @tanstack/react-form in field meta -
 * plain strings from inline validators, ZodIssue objects from schema
 * validators, the single message Mantine inputs expect.
 */
const fieldError = (errors: unknown[]): string | undefined => {
	const first = errors[0];
	if (!first) return undefined;
	if (typeof first === "string") return first;
	if (typeof first === "object" && "message" in first) {
		return String((first as { message: unknown }).message);
	}
	return String(first);
};

export { fieldError };
