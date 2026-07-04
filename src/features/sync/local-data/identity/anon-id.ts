/**
 * Persistent anonymous user ID for pre-user data collection.
 * Allows users to collect items before signing up; the ID travels with pending ops
 * so the created-builds can attribute offline writes to the correct user after login.
 */

/** localStorage key: "toolkitsgg.anonUserId" */
const STORAGE_KEY = "toolkitsgg.anonUserId";

/**
 * Returns the stored anon ID or generates and persists a new one.
 * Returns an empty string on the created-builds (localStorage is unavailable during SSR);
 * this value is never used created-builds-side, only in IndexedDB writes.
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
 * Removes the stored anon ID.
 * Called on login to prevent the anon identity from being reused after the user authenticates.
 */
const clearAnonUserId = (): void => {
	if (typeof window === "undefined") return;
	window.localStorage.removeItem(STORAGE_KEY);
};

export { clearAnonUserId, getOrCreateAnonUserId };
