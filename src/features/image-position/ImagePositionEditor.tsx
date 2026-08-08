import { Button, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import {
	type KeyboardEvent,
	type PointerEvent,
	useId,
	useRef,
	useState,
} from "react";
import { appImageSrc } from "#/components/AppImage";
import {
	clampImagePosition,
	DEFAULT_IMAGE_POSITION,
	type ImagePosition,
	imagePositionToCss,
	isDefaultImagePosition,
} from "#/features/image-position/image-position";
import classes from "./ImagePositionEditor.module.css";

type ImagePositionEditorProps = {
	/** Stored or absolute; resolved the same way AppImage resolves its src. */
	src: string;
	/** Used when `src` is a resized variant that has not been uploaded yet. */
	fallbackSrc?: string;
	alt: string;
	value: ImagePosition;
	onChange: (next: ImagePosition) => void;
	/** width / height of the frame this image fills on the real surface. */
	aspectRatio: number;
};

type DragState = {
	pointerId: number;
	clientX: number;
	clientY: number;
	origin: ImagePosition;
	overflowX: number;
	overflowY: number;
};

type NaturalSize = { src: string; width: number; height: number };

/** One arrow press, as a fraction of the hidden overflow. */
const KEYBOARD_STEP = 0.02;

/**
 * Sub-pixel overflow is rounding, not room to pan, and dividing by it would
 * send the position to an extreme on the first pixel of movement.
 */
const MIN_OVERFLOW = 1;

/**
 * Drag-to-pan for an image that will be rendered with `cover` in a frame it does
 * not match the shape of.
 *
 * The gesture is direct manipulation: the image follows the pointer, which means
 * the stored percentage moves opposite to the drag. Travel is scaled by how much
 * of the image is actually hidden, so a drag across the frame moves the image by
 * exactly the amount that is off-screen rather than by an arbitrary constant.
 */
const ImagePositionEditor = ({
	src,
	fallbackSrc,
	alt,
	value,
	onChange,
	aspectRatio,
}: ImagePositionEditorProps) => {
	const hintId = useId();
	const frameRef = useRef<HTMLButtonElement>(null);
	const dragRef = useRef<DragState | null>(null);
	const [dragging, setDragging] = useState(false);
	// Both are keyed by src so they reset themselves when the image changes,
	// rather than briefly describing the previous one.
	const [failedSrc, setFailedSrc] = useState<string | null>(null);
	const [natural, setNatural] = useState<NaturalSize | null>(null);

	const resolvedSrc =
		failedSrc === src && fallbackSrc
			? appImageSrc(fallbackSrc)
			: appImageSrc(src);
	const size = natural?.src === resolvedSrc ? natural : null;

	// `cover` overflows on exactly one axis, so the image's own ratio against the
	// frame's is enough to know which one can move without measuring anything.
	const imageRatio = size ? size.width / size.height : null;
	const canPanX = imageRatio !== null && imageRatio > aspectRatio;
	const canPanY = imageRatio !== null && imageRatio < aspectRatio;
	const pannable = canPanX || canPanY;

	const measureOverflow = () => {
		const frame = frameRef.current;
		if (!frame || !size) return { x: 0, y: 0 };
		const rect = frame.getBoundingClientRect();
		const scale = Math.max(rect.width / size.width, rect.height / size.height);
		return {
			x: size.width * scale - rect.width,
			y: size.height * scale - rect.height,
		};
	};

	const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
		if (!pannable) return;
		const overflow = measureOverflow();
		dragRef.current = {
			pointerId: event.pointerId,
			clientX: event.clientX,
			clientY: event.clientY,
			origin: value,
			overflowX: overflow.x,
			overflowY: overflow.y,
		};
		event.currentTarget.setPointerCapture(event.pointerId);
		setDragging(true);
	};

	const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
		const drag = dragRef.current;
		if (!drag || drag.pointerId !== event.pointerId) return;
		const dx = event.clientX - drag.clientX;
		const dy = event.clientY - drag.clientY;
		onChange(
			clampImagePosition({
				x:
					drag.overflowX >= MIN_OVERFLOW
						? drag.origin.x - dx / drag.overflowX
						: drag.origin.x,
				y:
					drag.overflowY >= MIN_OVERFLOW
						? drag.origin.y - dy / drag.overflowY
						: drag.origin.y,
			}),
		);
	};

	const endDrag = (event: PointerEvent<HTMLButtonElement>) => {
		const drag = dragRef.current;
		if (!drag || drag.pointerId !== event.pointerId) return;
		dragRef.current = null;
		event.currentTarget.releasePointerCapture(event.pointerId);
		setDragging(false);
	};

	const nudge = (dx: number, dy: number) =>
		onChange(clampImagePosition({ x: value.x + dx, y: value.y + dy }));

	const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
		if (!pannable) return;
		const step = event.shiftKey ? KEYBOARD_STEP * 5 : KEYBOARD_STEP;
		switch (event.key) {
			case "ArrowUp":
				if (canPanY) nudge(0, step);
				break;
			case "ArrowDown":
				if (canPanY) nudge(0, -step);
				break;
			case "ArrowLeft":
				if (canPanX) nudge(step, 0);
				break;
			case "ArrowRight":
				if (canPanX) nudge(-step, 0);
				break;
			default:
				return;
		}
		event.preventDefault();
	};

	return (
		<Stack gap={6}>
			{/* A button rather than a div: it is genuinely operable, and the drag
			    gesture rides on top of focus and key handling it gets for free. */}
			<UnstyledButton
				ref={frameRef}
				type="button"
				className={`${classes.frame} ${pannable ? classes.pannable : ""} ${
					dragging ? classes.dragging : ""
				}`}
				style={{ aspectRatio }}
				aria-label={`Reposition ${alt}`}
				aria-describedby={hintId}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={endDrag}
				onPointerCancel={endDrag}
				onKeyDown={handleKeyDown}
			>
				<img
					src={resolvedSrc}
					alt={alt}
					className={classes.image}
					style={{ objectPosition: imagePositionToCss(value) }}
					draggable={false}
					onError={() => setFailedSrc(src)}
					onLoad={(event) =>
						setNatural({
							src: resolvedSrc,
							width: event.currentTarget.naturalWidth,
							height: event.currentTarget.naturalHeight,
						})
					}
				/>
			</UnstyledButton>
			<Group justify="space-between" gap="xs" wrap="nowrap">
				<Text size="xs" c="dimmed" id={hintId}>
					{pannable
						? "Drag to reposition, or use the arrow keys."
						: "This image already fits the frame."}
				</Text>
				<Button
					variant="subtle"
					size="compact-xs"
					disabled={!pannable || isDefaultImagePosition(value)}
					onClick={() => onChange(DEFAULT_IMAGE_POSITION)}
				>
					Center
				</Button>
			</Group>
		</Stack>
	);
};

export { ImagePositionEditor };
