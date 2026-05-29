import { notifications } from "@mantine/notifications";
import type React from "react";
import { ScreenshotPreview } from "#/features/screenshot/core/ScreenshotPreview";
import { useScreenshotPreviewStore } from "./store";

const ScreenshotPreviewProvider: React.FC = () => {
	const {
		screenshot,
		screenshotLoading,
		error,
		opened,
		title,
		clearPreview,
		closePreview,
		setError,
	} = useScreenshotPreviewStore();

	return (
		<ScreenshotPreview
			screenshot={screenshot}
			loading={screenshotLoading}
			error={error}
			onSave={() => {
				if (!screenshot) return;
				const link = document.createElement("a");
				link.href = screenshot;
				link.download = title || "screenshot.png";
				link.click();
			}}
			onCopy={async () => {
				if (!screenshot) return;
				try {
					const res = await fetch(screenshot);
					const blob = await res.blob();
					await navigator.clipboard.write([
						new window.ClipboardItem({ "image/png": blob }),
					]);
					notifications.show({
						title: "Success",
						message: "Screenshot copied to clipboard",
						color: "green",
					});
				} catch {
					setError("Failed to copy screenshot");
				}
			}}
			onClear={() => {
				clearPreview();
				closePreview();
			}}
			title={title}
			opened={opened}
		/>
	);
};

export { ScreenshotPreviewProvider };
