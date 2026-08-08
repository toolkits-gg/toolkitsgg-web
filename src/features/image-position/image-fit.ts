/**
 * How an image is laid into a frame it does not match the shape of.
 *
 * `cover` fills the frame and crops the overflowing axis, which is the thing
 * the stored focal point frames. `contain` keeps the whole image visible and
 * leaves the frame's leftover space to whatever is rendered behind it, which
 * makes the focal point meaningless.
 */
type ImageFit = "cover" | "contain";

const IMAGE_FIT_VALUES = ["cover", "contain"] as const;

const DEFAULT_IMAGE_FIT: ImageFit = "cover";

/** Reads a stored value back. Nulls predate the column and were all cropped. */
const toImageFit = (value: string | null | undefined): ImageFit =>
	value === "contain" ? "contain" : DEFAULT_IMAGE_FIT;

export { DEFAULT_IMAGE_FIT, IMAGE_FIT_VALUES, type ImageFit, toImageFit };
