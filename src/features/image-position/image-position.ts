/**
 * Where an image sits inside a frame it does not match the shape of.
 *
 * Both axes are stored even though only one can ever be off-center: `cover`
 * overflows on a single axis, and which one that is depends on the viewport
 * (a build card is wider than its art on desktop and narrower on mobile). CSS
 * ignores the percentage on the axis that fits, so keeping both means the same
 * stored pair survives a resize instead of being re-cropped by it.
 */
type ImagePosition = { x: number; y: number };

const DEFAULT_IMAGE_POSITION: ImagePosition = { x: 0.5, y: 0.5 };

/**
 * Three decimals: a pixel of travel on a 4K source is a smaller step than this,
 * and rounding keeps drag output out of float-noise territory so an untouched
 * position compares equal to the default.
 */
const PRECISION = 1000;

const clampAxis = (value: number | null | undefined): number => {
	if (typeof value !== "number" || !Number.isFinite(value)) return 0.5;
	return Math.round(Math.min(1, Math.max(0, value)) * PRECISION) / PRECISION;
};

const clampImagePosition = (position: {
	x: number | null | undefined;
	y: number | null | undefined;
}): ImagePosition => ({
	x: clampAxis(position.x),
	y: clampAxis(position.y),
});

/**
 * Reads a stored pair back. Nulls center the image, which is what rows written
 * before these columns existed should look like.
 */
const toImagePosition = (
	x: number | null | undefined,
	y: number | null | undefined,
): ImagePosition => clampImagePosition({ x, y });

/** The `object-position` / `background-position` value for a position. */
const imagePositionToCss = ({ x, y }: ImagePosition): string =>
	`${Math.round(x * PRECISION) / 10}% ${Math.round(y * PRECISION) / 10}%`;

const imagePositionsEqual = (a: ImagePosition, b: ImagePosition): boolean =>
	a.x === b.x && a.y === b.y;

const isDefaultImagePosition = (position: ImagePosition): boolean =>
	imagePositionsEqual(position, DEFAULT_IMAGE_POSITION);

export {
	clampImagePosition,
	DEFAULT_IMAGE_POSITION,
	type ImagePosition,
	imagePositionsEqual,
	imagePositionToCss,
	isDefaultImagePosition,
	toImagePosition,
};
