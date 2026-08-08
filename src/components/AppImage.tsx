import {
	Image as MantineImage,
	type ImageProps as MantineImageProps,
} from "@mantine/core";
import { clientEnv } from "#/env/client-env";
import IMAGE_SIZES from "#/image-sizes.json";

type SizePreset = keyof typeof IMAGE_SIZES;

type AppImageProps = MantineImageProps & {
	alt: string;
	size?: SizePreset;
	loading?: "lazy" | "eager";
};

const withSizeSuffix = (src: string, size: SizePreset) => {
	const [w, h] = IMAGE_SIZES[size];
	return src.replace(/(\.[a-z0-9]+)$/i, `-${w}x${h}$1`);
};

/**
 * How AppImage resolves a src, for the places that need the URL itself rather
 * than the component - a bare <img> whose natural dimensions have to be read,
 * for instance.
 */
const appImageSrc = (src: string, size?: SizePreset): string => {
	if (src.startsWith("http")) return src;
	const sized = size ? withSizeSuffix(src, size) : src;
	return `${clientEnv.VITE_CLOUDFRONT_URL}/${sized.replace(/^\//, "")}`;
};

const AppImage = ({ src, size, ...rest }: AppImageProps) => {
	const resolvedSrc =
		src && typeof src === "string" ? appImageSrc(src, size) : src;
	return <MantineImage src={resolvedSrc} {...rest} />;
};

export { AppImage, type AppImageProps, appImageSrc };
