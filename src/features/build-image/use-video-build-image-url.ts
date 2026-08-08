import { useEffect, useState } from "react";
import {
	buildImageFallbackUrl,
	videoToBuildImageUrl,
} from "#/features/build-image/build-image-url";
import { isMissingThumbnailImage } from "#/integrations/youtube/utils";

/**
 * The best thumbnail a video actually has, resolved before it can be stored.
 *
 * `maxresdefault` does not exist for every upload, and the chosen URL outlives
 * this picker, so a missing one cannot be left for render time to discover: it
 * would show YouTube's grey placeholder on every later view of the build, and
 * leave the framing editor measuring a 120x90 image it thinks is the art.
 *
 * The probe reads the decoded size rather than listening for a failure, because
 * a missing variant loads successfully as far as the browser is concerned. It
 * starts optimistic, so the tile renders without waiting on the round trip.
 */
const useVideoBuildImageUrl = (videoUrl: string): string | null => {
	const preferred = videoToBuildImageUrl(videoUrl);
	// Keyed by the URL it describes, so a new video is never reported as missing
	// on the strength of the previous one.
	const [missing, setMissing] = useState<string | null>(null);

	useEffect(() => {
		if (!preferred) return;
		const fallback = buildImageFallbackUrl(preferred);
		if (fallback === preferred) return;

		const probe = new window.Image();
		const reject = () => setMissing(preferred);
		probe.onload = () => {
			if (isMissingThumbnailImage(probe.naturalWidth)) reject();
		};
		probe.onerror = reject;
		probe.src = preferred;
		return () => {
			probe.onload = null;
			probe.onerror = null;
		};
	}, [preferred]);

	if (!preferred) return null;
	return missing === preferred ? buildImageFallbackUrl(preferred) : preferred;
};

export { useVideoBuildImageUrl };
