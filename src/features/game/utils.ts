/**
 * Writes the active-game preference cookie from the client.
 * Read on the created-builds in beforeLoad to seed the gameId resolution chain.
 * `null` clears the cookie.
 */
export const setActiveGameCookie = (value: string | null): void => {
	if (typeof document === "undefined") return;
	const base = `active-game=${value ? encodeURIComponent(value) : ""}; path=/; samesite=lax`;
	const maxAge = value ? "; max-age=31536000" : "; max-age=0";
	const secure = import.meta.env.PROD ? "; secure" : "";
	// biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API isn't supported in Safari/Firefox.
	document.cookie = `${base}${maxAge}${secure}`;
};
