/**
 * Reddit's OAuth scopes never expose an email address, so better-auth stores an
 * unroutable placeholder on the account. Nothing can be mailed to it, which is
 * why the UI asks these users for a real address.
 */
const PLACEHOLDER_EMAIL_DOMAIN = "reddit.invalid";

const isPlaceholderEmail = (email: string) =>
	email.toLowerCase().endsWith(`@${PLACEHOLDER_EMAIL_DOMAIN}`);

export { isPlaceholderEmail, PLACEHOLDER_EMAIL_DOMAIN };
