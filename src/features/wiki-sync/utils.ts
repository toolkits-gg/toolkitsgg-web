/**
 * Appends a required User-Agent header to fetch requests and avoid
 * rate limit from the wiki.gg API.
 */
const fetchWithUserAgent = (url: string, options?: RequestInit) => {
	const headers = {
		"User-Agent":
			"Mozilla/5.0 (User: Toolkits.gg, toolkits.gg wiki-sync; https://toolkits.gg)",
		...options?.headers,
	};

	return fetch(url, {
		...options,
		headers,
	});
};

export { fetchWithUserAgent };
