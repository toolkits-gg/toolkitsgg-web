/**
 * YouTube URL parsing, built around a single primitive: extract the video id, or
 * report that there isn't one.
 *
 * A build's `videoUrl` is free text, so every function here has to survive
 * arbitrary input without throwing. That is why parsing goes through
 * `parseUrl` rather than a bare `new URL()`.
 */

/** YouTube ids are 11 characters of the URL-safe base64 alphabet. */
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

const WATCH_HOSTS = new Set([
	"youtube.com",
	"www.youtube.com",
	"m.youtube.com",
	"music.youtube.com",
	"youtube-nocookie.com",
	"www.youtube-nocookie.com",
]);

const SHORT_HOSTS = new Set(["youtu.be", "www.youtu.be"]);

/** Path prefixes that carry the id as the segment immediately after them. */
const PATH_PREFIXES = ["embed", "shorts", "live", "v"];

const parseUrl = (value: string): URL | null => {
	try {
		return new URL(value);
	} catch {
		return null;
	}
};

const asVideoId = (value: string | null | undefined): string | null =>
	value && VIDEO_ID_PATTERN.test(value) ? value : null;

/**
 * The 11-character video id, or null for anything that isn't a YouTube video
 * URL. Tolerates extra params (`si`, `t`, `list`, `index`) by reading only the
 * parts that identify the video.
 */
const youtubeVideoId = (videoUrl: string | null | undefined): string | null => {
	if (!videoUrl) return null;
	const url = parseUrl(videoUrl.trim());
	if (!url) return null;
	if (url.protocol !== "http:" && url.protocol !== "https:") return null;

	const host = url.hostname.toLowerCase();
	const segments = url.pathname.split("/").filter(Boolean);

	if (SHORT_HOSTS.has(host)) return asVideoId(segments[0]);
	if (!WATCH_HOSTS.has(host)) return null;

	if (segments[0] === "watch") return asVideoId(url.searchParams.get("v"));
	if (segments.length === 2 && PATH_PREFIXES.includes(segments[0])) {
		return asVideoId(segments[1]);
	}
	return null;
};

/**
 * The thumbnail variants a build image may hold.
 *
 * `maxresdefault` and `mqdefault` are the true 16:9 frame; `hqdefault` is 4:3
 * with the black bars baked into the pixels, and is here only because builds
 * saved before the switch still store it.
 */
const THUMBNAIL_VARIANTS = ["maxresdefault", "mqdefault", "hqdefault"] as const;

const THUMBNAIL_URL_PATTERN = new RegExp(
	`^https://i\\.ytimg\\.com/vi/([A-Za-z0-9_-]{11})/(?:${THUMBNAIL_VARIANTS.join("|")})\\.jpg$`,
);

const thumbnailUrl = (videoId: string, variant: string): string =>
	`https://i.ytimg.com/vi/${videoId}/${variant}.jpg`;

/**
 * The thumbnail for a video, or null when the URL isn't one.
 *
 * `maxresdefault` is 1280x720 and 404s on uploads old enough to predate it,
 * which is what `youtubeThumbnailFallbackUrl` covers.
 */
const youtubeThumbnailUrl = (
	videoUrl: string | null | undefined,
): string | null => {
	const videoId = youtubeVideoId(videoUrl);
	return videoId ? thumbnailUrl(videoId, "maxresdefault") : null;
};

/**
 * Whether a loaded thumbnail is really YouTube's "no such variant" image.
 *
 * A missing variant comes back as a 404 whose body is a valid 120x90 grey
 * JPEG. Browsers decode it and fire `load` rather than `error`, so neither the
 * status nor a failure handler is reachable from an `<img>`; the size is the
 * only signal. Every real variant is at least `mqdefault`'s 320px wide.
 */
const MIN_REAL_THUMBNAIL_WIDTH = 320;

const isMissingThumbnailImage = (naturalWidth: number): boolean =>
	naturalWidth > 0 && naturalWidth < MIN_REAL_THUMBNAIL_WIDTH;

/** The video a stored thumbnail URL belongs to, or null if it isn't one. */
const youtubeThumbnailVideoId = (
	thumbnailUrlValue: string | null | undefined,
): string | null =>
	thumbnailUrlValue?.match(THUMBNAIL_URL_PATTERN)?.[1] ?? null;

/**
 * What to render when a thumbnail URL fails to load. `mqdefault` is 320x180 and
 * exists for every video ever uploaded, so the chain terminates here.
 */
const youtubeThumbnailFallbackUrl = (
	thumbnailUrlValue: string | null | undefined,
): string | null => {
	const videoId = youtubeThumbnailVideoId(thumbnailUrlValue);
	return videoId ? thumbnailUrl(videoId, "mqdefault") : null;
};

/**
 * The canonical watch URL, preserving a start time when one is present.
 * Returns the input unchanged when it isn't a YouTube URL, so this is safe to
 * apply to an arbitrary link.
 */
const youtubeWatchUrl = (videoUrl: string): string => {
	const videoId = youtubeVideoId(videoUrl);
	if (!videoId) return videoUrl;

	const url = parseUrl(videoUrl.trim());
	const start = url?.searchParams.get("t") ?? url?.searchParams.get("start");
	const suffix = start ? `&t=${start}` : "";
	return `https://www.youtube.com/watch?v=${videoId}${suffix}`;
};

export {
	isMissingThumbnailImage,
	youtubeThumbnailFallbackUrl,
	youtubeThumbnailUrl,
	youtubeThumbnailVideoId,
	youtubeWatchUrl,
};
