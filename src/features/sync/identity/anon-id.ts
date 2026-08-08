/**
 * Persistent anonymous user ID for pre-user data collection.
 * Allows users to collect items before signing up; the ID travels with pending ops
 * so the server can attribute queued writes to the correct user after login.
 */

/** localStorage key: "toolkitsgg.anonUserId" */
const STORAGE_KEY = "toolkitsgg.anonUserId";

/**
 * Returns the stored anon ID or generates and persists a new one.
 * Returns an empty string on the server (localStorage is unavailable during SSR);
 * this value is never used server-side, only in IndexedDB writes.
 */
const getOrCreateAnonUserId = (): string => {
	if (typeof window === "undefined") return "";
	let id = window.localStorage.getItem(STORAGE_KEY);
	if (!id) {
		id = crypto.randomUUID();
		window.localStorage.setItem(STORAGE_KEY, id);
	}
	return id;
};

/**
 * Reads the stored anon ID without creating one.
 * Callers that only need to know whether an anonymous identity exists use this;
 * minting an ID for a visitor who never had one would make them look like they
 * have local data to claim.
 */
const getAnonUserId = (): string | null => {
	if (typeof window === "undefined") return null;
	return window.localStorage.getItem(STORAGE_KEY);
};

/**
 * Removes the stored anon ID.
 * Called on login to prevent the anon identity from being reused after the user authenticates.
 */
const clearAnonUserId = (): void => {
	if (typeof window === "undefined") return;
	window.localStorage.removeItem(STORAGE_KEY);
};

export { clearAnonUserId, getAnonUserId, getOrCreateAnonUserId };
