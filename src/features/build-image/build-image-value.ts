import { type ImageFit, toImageFit } from "#/features/image-position/image-fit";
import {
	type ImagePosition,
	toImagePosition,
} from "#/features/image-position/image-position";

/**
 * A build image and how it is laid out, which only ever move together: the fit
 * decides whether the position means anything, and both are reset when the
 * image itself changes.
 */
type BuildImageValue = {
	imageUrl: string;
	imagePosition: ImagePosition;
	imageFit: ImageFit;
};

/** The columns a build row carries the image in, before they are read back. */
type StoredBuildImage = {
	imageUrl?: string | null;
	thumbnailUrl?: string | null;
	imagePositionX?: number | null;
	imagePositionY?: number | null;
	imageFit?: string | null;
};

/**
 * Reads a build row's image columns back into the value every renderer takes,
 * so the card and the view page cannot disagree about which column wins or how
 * a null fit is narrowed.
 */
const toBuildImageValue = (build: StoredBuildImage): BuildImageValue => ({
	imageUrl: build.thumbnailUrl ?? build.imageUrl ?? "",
	imagePosition: toImagePosition(build.imagePositionX, build.imagePositionY),
	imageFit: toImageFit(build.imageFit),
});

export { type BuildImageValue, toBuildImageValue };
