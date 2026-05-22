import {
	Box,
	Button,
	Dialog,
	Group,
	Loader,
	Image as MantineImage,
	Text,
	Title,
} from "@mantine/core";

type ScreenshotPreviewProps = {
	screenshot: string | null;
	loading: boolean;
	error: string | null;
	onSave: () => void;
	onCopy: () => void;
	onClear: () => void;
	title?: string;
	opened: boolean;
};

type ScreenshotPreviewModalHandle = {
	open: () => void;
	close: () => void;
};

function ScreenshotPreview({
	screenshot,
	loading,
	error,
	onSave,
	onCopy,
	onClear,
	title,
	opened,
}: ScreenshotPreviewProps) {
	return (
		<Dialog
			opened={opened}
			onClose={onClear}
			size="md"
			withCloseButton
			bg="light-dark(var(--mantine-color-popover-4),var(--mantine-color-popover-8))"
			zIndex="var(--mantine-z-index-modal)"
		>
			<Box ta="center">
				<Title order={4} mb="sm" c="primary.5" px="lg">
					{title || "Screenshot Preview"}
				</Title>
				{loading && <Loader />}
				{error && <Text c="error">{error}</Text>}

				{screenshot && (
					<MantineImage
						src={screenshot}
						alt="Screenshot preview"
						mx="auto"
						style={{
							maxWidth: "100%",
							maxHeight: 350,
							width: 150,
							height: 304,
							objectFit: "contain",
						}}
					/>
				)}
				<Group justify="center" mt="md">
					<Button onClick={onSave} disabled={!screenshot}>
						Save
					</Button>
					<Button onClick={onCopy} disabled={!screenshot}>
						Copy
					</Button>
					<Button variant="default" onClick={onClear}>
						Clear
					</Button>
				</Group>
			</Box>
		</Dialog>
	);
}

export {
	ScreenshotPreview,
	type ScreenshotPreviewModalHandle,
	type ScreenshotPreviewProps,
};
