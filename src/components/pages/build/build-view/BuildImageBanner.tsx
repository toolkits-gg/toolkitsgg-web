import { Box } from "@mantine/core";
import { LuPlay } from "react-icons/lu";
import { BuildImageFrame } from "#/features/build-image/BuildImageFrame";
import { BUILD_CARD_ASPECT_RATIO } from "#/features/build-image/build-image-url";
import type { BuildImageValue } from "#/features/build-image/build-image-value";
import { youtubeWatchUrl } from "#/integrations/youtube/utils";
import classes from "./BuildImageBanner.module.css";

type BuildImageBannerProps = {
	image?: BuildImageValue | null;
	name: string;
	videoUrl?: string | null;
	referenceUrl?: string | null;
	/** Used to omit certain elements during screenshot, like buttons. */
	screenshotMode: boolean;
};

/**
 * The build's image at the head of the view, doubling as the way in to its
 * video.
 *
 * The frame keeps the card's aspect ratio because that is the shape the author
 * framed the image against in the editor, so the banner crops the same way the
 * card does rather than re-cropping art they already positioned.
 */
const BuildImageBanner = ({
	image,
	name,
	videoUrl,
	referenceUrl,
	screenshotMode,
}: BuildImageBannerProps) => {
	if (!image?.imageUrl) return null;

	const frame = (
		<BuildImageFrame
			src={image.imageUrl}
			alt={name}
			fit={image.imageFit}
			position={image.imagePosition}
			aspectRatio={BUILD_CARD_ASPECT_RATIO}
			className={classes.frame}
		/>
	);

	const target = videoUrl ? youtubeWatchUrl(videoUrl) : referenceUrl;
	if (!target || screenshotMode) {
		return <Box className={classes.banner}>{frame}</Box>;
	}

	return (
		<Box className={classes.banner}>
			<a
				href={target}
				target="_blank"
				rel="noreferrer"
				className={classes.link}
				aria-label={
					videoUrl ? `Watch video for ${name}` : `Open reference for ${name}`
				}
			>
				{frame}
				{videoUrl && (
					<Box className={classes.playBadge}>
						<LuPlay size={24} fill="currentColor" />
					</Box>
				)}
			</a>
		</Box>
	);
};

export { BuildImageBanner };
