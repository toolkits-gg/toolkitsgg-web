import { ActionIcon, Box, Button, Group, Input, Stack } from "@mantine/core";
import { modals } from "@mantine/modals";
import { LuImage, LuX } from "react-icons/lu";
import { BuildImagePicker } from "#/components/pages/build/build-editor/BuildImagePicker";
import { BuildImageFrame } from "#/features/build-image/BuildImageFrame";
import { BUILD_CARD_ASPECT_RATIO } from "#/features/build-image/build-image-url";
import type { BuildImageValue } from "#/features/build-image/build-image-value";
import { DEFAULT_IMAGE_FIT } from "#/features/image-position/image-fit";
import { DEFAULT_IMAGE_POSITION } from "#/features/image-position/image-position";
import classes from "./BuildImageField.module.css";

type BuildImageFieldProps = {
	value: BuildImageValue;
	videoUrl: string;
	onChange: (next: BuildImageValue) => void;
};

const BuildImageField = ({
	value,
	videoUrl,
	onChange,
}: BuildImageFieldProps) => {
	const openPicker = () => {
		const id = modals.open({
			title: "Choose build image",
			size: "lg",
			children: (
				<BuildImagePicker
					value={value}
					videoUrl={videoUrl}
					onConfirm={onChange}
					onClose={() => modals.close(id)}
				/>
			),
		});
	};

	return (
		<Stack gap="xs">
			<Input.Label>Build image</Input.Label>
			<Group align="flex-start" gap="sm">
				<Box className={classes.previewWrapper}>
					<BuildImageFrame
						src={value.imageUrl || undefined}
						alt="Build image"
						fit={value.imageFit}
						position={value.imagePosition}
						aspectRatio={BUILD_CARD_ASPECT_RATIO}
						className={classes.preview}
					/>
					{value.imageUrl && (
						<ActionIcon
							variant="filled"
							color="red"
							size="sm"
							radius="xl"
							aria-label="Remove build image"
							className={classes.clear}
							onClick={() =>
								onChange({
									imageUrl: "",
									imagePosition: DEFAULT_IMAGE_POSITION,
									imageFit: DEFAULT_IMAGE_FIT,
								})
							}
						>
							<LuX size={12} />
						</ActionIcon>
					)}
				</Box>
				<Button
					variant="light"
					size="xs"
					leftSection={<LuImage size={14} />}
					onClick={openPicker}
				>
					{value.imageUrl ? "Change image" : "Choose image"}
				</Button>
			</Group>
			<Input.Description>
				Shown on your build's card. Pick a wallpaper, or your video's thumbnail
				if the build has one.
			</Input.Description>
		</Stack>
	);
};

export { BuildImageField };
