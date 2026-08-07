export const capitalize = (s: string): string =>
	s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);

/** Title-cases a string, splitting on spaces and underscores. */
export const titleCase = (str: string): string =>
	str
		.split(/[_ ]/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");

/**
 * Tiny cookie-header parser for server-side reads. Returns the decoded value of
 * the named cookie or null if absent. Format: "a=1; b=2; c=3".
 */
export const parseCookie = (header: string, name: string): string | null => {
	const parts = header.split(/;\s*/);
	for (const part of parts) {
		const eq = part.indexOf("=");
		if (eq === -1) continue;
		const k = part.slice(0, eq);
		if (k !== name) continue;
		const v = part.slice(eq + 1);
		try {
			return decodeURIComponent(v);
		} catch {
			return v;
		}
	}
	return null;
};
