import {
	Button,
	Divider,
	Group,
	SegmentedControl,
	Stack,
	Text,
	UnstyledButton,
} from "@mantine/core";
import { useState } from "react";
import { AppImage } from "#/components/AppImage.tsx";
import { BuildImageFrame } from "#/features/build-image/BuildImageFrame.tsx";
import {
	BUILD_CARD_ASPECT_RATIO,
	buildImageFallbackUrl,
	buildImageUrlToWallpaper,
	defaultBuildImageFit,
	wallpaperToBuildImageUrl,
} from "#/features/build-image/build-image-url.ts";
import type { BuildImageValue } from "#/features/build-image/build-image-value.ts";
import { useVideoBuildImageUrl } from "#/features/build-image/use-video-build-image-url.ts";
import { useGameId } from "#/features/game/use-game-id.ts";
import { ImagePositionEditor } from "#/features/image-position/ImagePositionEditor.tsx";
import type { ImageFit } from "#/features/image-position/image-fit.ts";
import { DEFAULT_IMAGE_POSITION } from "#/features/image-position/image-position.ts";
import {
	defaultWallpaperGameId,
	WallpaperPicker,
	type WallpaperSelection,
} from "#/features/wallpaper/WallpaperPicker.tsx";
import { getGameWallpapers } from "#/games-registry/public-registry.ts";
import type { GameId } from "@/prisma";
import classes from "./BuildImagePicker.module.css";

type BuildImagePickerProps = {
	// The build's current image.
	value: BuildImageValue;
	videoUrl: string;
	onConfirm: (next: BuildImageValue) => void;
	onClose: () => void;
};

const FIT_OPTIONS = [
	{ value: "cover", label: "Fill card" },
	{ value: "contain", label: "Show whole image" },
];

/** Turns a stored image back into a picker selection so it renders as chosen. */
const toWallpaperSelection = (value: string): WallpaperSelection | null => {
	const match = buildImageUrlToWallpaper(value);
	if (!match) return null;
	return { wallpaperId: match.wallpaper.id, wallpaperGameId: match.gameId };
};

const BuildImagePicker = ({
	value,
	videoUrl,
	onConfirm,
	onClose,
}: BuildImagePickerProps) => {
	const activeGameId = useGameId();
	const videoThumbnail = useVideoBuildImageUrl(videoUrl);
	const [pending, setPending] = useState<BuildImageValue>(value);
	const [browsingGameId, setBrowsingGameId] = useState<GameId>(() =>
		defaultWallpaperGameId(
			buildImageUrlToWallpaper(value.imageUrl)?.gameId ?? activeGameId,
		),
	);

	const selection = toWallpaperSelection(pending.imageUrl);

	// Layout belongs to one image, so switching images starts over: centered, and
	// at whichever fit suits the new image's shape.
	const changeImage = (next: string) => {
		if (next === pending.imageUrl) return;
		setPending({
			imageUrl: next,
			imagePosition: DEFAULT_IMAGE_POSITION,
			imageFit: defaultBuildImageFit(next),
		});
	};

	const handleWallpaperSelect = (next: WallpaperSelection) => {
		const wallpaper = (getGameWallpapers(next.wallpaperGameId) ?? []).find(
			(w) => w.id === next.wallpaperId,
		);
		if (!wallpaper) return;
		changeImage(wallpaperToBuildImageUrl(wallpaper, next.wallpaperGameId));
	};

	const handleConfirm = () => {
		onConfirm(pending);
		onClose();
	};

	return (
		<Stack gap="md">
			{videoThumbnail && (
				<>
					<Stack gap="xs">
						<Text size="xs" c="dimmed" tt="uppercase" fw={700}>
							From your video
						</Text>
						<UnstyledButton
							className={`${classes.videoTile} ${
								pending.imageUrl === videoThumbnail
									? classes.videoTileSelected
									: ""
							}`}
							onClick={() => changeImage(videoThumbnail)}
						>
							<AppImage
								src={videoThumbnail}
								alt="Video thumbnail"
								className={classes.videoImage}
								fallbackSrc={buildImageFallbackUrl(videoThumbnail)}
							/>
						</UnstyledButton>
					</Stack>
					<Divider label="Or pick a wallpaper" labelPosition="center" />
				</>
			)}

			{pending.imageUrl && (
				<Stack gap={4}>
					<Text size="xs" fw={600}>
						On the build card
					</Text>
					<SegmentedControl
						size="xs"
						fullWidth
						data={FIT_OPTIONS}
						value={pending.imageFit}
						onChange={(next) =>
							setPending((prev) => ({ ...prev, imageFit: next as ImageFit }))
						}
					/>
					{pending.imageFit === "cover" ? (
						<ImagePositionEditor
							src={pending.imageUrl}
							fallbackSrc={buildImageFallbackUrl(pending.imageUrl)}
							alt="Build image"
							value={pending.imagePosition}
							onChange={(next) =>
								setPending((prev) => ({ ...prev, imagePosition: next }))
							}
							aspectRatio={BUILD_CARD_ASPECT_RATIO}
						/>
					) : (
						<BuildImageFrame
							src={pending.imageUrl}
							alt="Build image"
							fit="contain"
							position={pending.imagePosition}
							aspectRatio={BUILD_CARD_ASPECT_RATIO}
							className={classes.containPreview}
						/>
					)}
				</Stack>
			)}

			<WallpaperPicker
				value={selection}
				onSelect={handleWallpaperSelect}
				browsingGameId={browsingGameId}
				onBrowsingGameChange={setBrowsingGameId}
			/>

			<Group justify="space-between">
				<Button
					variant="subtle"
					color="red"
					size="xs"
					disabled={pending.imageUrl === ""}
					onClick={() => changeImage("")}
				>
					Clear image
				</Button>
				<Group gap="xs">
					<Button variant="default" size="sm" onClick={onClose}>
						Cancel
					</Button>
					<Button size="sm" onClick={handleConfirm}>
						Use this image
					</Button>
				</Group>
			</Group>
		</Stack>
	);
};

export { BuildImagePicker };
