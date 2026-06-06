import {
	Image as MantineImage,
	type ImageProps as MantineImageProps,
} from "@mantine/core";
import { clientEnv } from "#/env/client-env.ts";
import IMAGE_SIZES from "#/features/game/registry/image-sizes.json";

type SizePreset = keyof typeof IMAGE_SIZES;

type AppImageProps = MantineImageProps & {
	alt: string;
	size?: SizePreset;
};

const withSizeSuffix = (src: string, size: SizePreset) => {
	const [w, h] = IMAGE_SIZES[size];
	return src.replace(/(\.[a-z0-9]+)$/i, `-${w}x${h}$1`);
};

const AppImage = ({ src, size, ...rest }: AppImageProps) => {
	let resolvedSrc = src;
	if (src && typeof src === "string" && !src.startsWith("http")) {
		const sized = size ? withSizeSuffix(src, size) : src;
		resolvedSrc = `${clientEnv.VITE_CLOUDFRONT_URL}/${sized.replace(/^\//, "")}`;
	}
	return <MantineImage src={resolvedSrc} {...rest} />;
};

export { AppImage, type AppImageProps };
