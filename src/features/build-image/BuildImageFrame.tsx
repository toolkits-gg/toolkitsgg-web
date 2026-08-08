import { Box } from "@mantine/core";
import { AppImage } from "#/components/AppImage";
import {
	BUILD_IMAGE_PLACEHOLDER,
	buildImageFallbackUrl,
} from "#/features/build-image/build-image-url";
import type { ImageFit } from "#/features/image-position/image-fit";
import {
	type ImagePosition,
	imagePositionToCss,
} from "#/features/image-position/image-position";
import classes from "./BuildImageFrame.module.css";

type BuildImageFrameProps = {
	src?: string;
	alt: string;
	fit: ImageFit;
	position: ImagePosition;
	/** The frame's own shape. Give it one or the other, not both. */
	height?: number;
	aspectRatio?: number;
	className?: string;
};

/**
 * A build image in the fixed-shape band a card gives it.
 *
 * A contained image cannot fill that band, so a blurred, enlarged copy of the
 * same file sits behind it. The alternative is a bar of card background wide
 * enough to read as a rendering fault rather than as deliberate letterboxing,
 * and reusing the image costs no extra request.
 */
const BuildImageFrame = ({
	src,
	alt,
	fit,
	position,
	height,
	aspectRatio,
	className,
}: BuildImageFrameProps) => {
	const showBackdrop = !!src && fit === "contain";

	return (
		<Box
			className={className ? `${classes.frame} ${className}` : classes.frame}
			style={{ height, aspectRatio }}
		>
			{showBackdrop && (
				<AppImage
					src={src}
					alt=""
					aria-hidden
					className={classes.backdrop}
					fallbackSrc={buildImageFallbackUrl(src)}
				/>
			)}
			<AppImage
				src={src || undefined}
				alt={alt}
				fit={fit}
				className={classes.image}
				fallbackSrc={src ? buildImageFallbackUrl(src) : BUILD_IMAGE_PLACEHOLDER}
				style={
					fit === "cover"
						? { objectPosition: imagePositionToCss(position) }
						: undefined
				}
			/>
		</Box>
	);
};

export { BuildImageFrame };
