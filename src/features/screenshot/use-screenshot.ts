import { useMantineTheme } from "@mantine/core";
import { domToBlob } from "modern-screenshot";
import { type RefObject, useRef } from "react";
import { useScreenshotPreviewStore } from "#/features/screenshot/store.ts";
import { logger } from "#/integrations/pino/logger.ts";

type ScreenshotResult = {
	triggerScreenshot: () => void;
	screenshotLoading: boolean;
};

type UseScreenshotProps = {
	ref?: RefObject<HTMLElement | null>;
	filename?: string;
};

function useScreenshot({
	ref,
	filename,
}: UseScreenshotProps): ScreenshotResult {
	const {
		screenshotLoading,
		setScreenshotLoading,
		setError,
		setScreenshot,
		openPreview,
	} = useScreenshotPreviewStore();
	const screenshotRef = useRef(ref);
	const mantineTheme = useMantineTheme();

	const triggerScreenshot = () => {
		const element = screenshotRef.current?.current;

		if (element) {
			openPreview({
				screenshot: null,
				screenshotLoading: true,
				error: null,
				title: filename || "Screenshot Preview",
			});

			setTimeout(async () => {
				setScreenshotLoading(true);
				setError(null);

				try {
					const blob = await domToBlob(element, {
						backgroundColor: mantineTheme.colors.base[5],
						quality: 1,
					});

					if (blob) {
						setScreenshot(URL.createObjectURL(blob));
					} else {
						setError("Failed to capture screenshot.");
					}
				} catch (error) {
					logger.error("Error capturing screenshot");
					setError(
						`Failed to capture screenshot: ${error instanceof Error ? error.message : "Unknown error"}`,
					);
				} finally {
					setScreenshotLoading(false);
				}
			}, 500);
		} else {
			setError("Element not found");
			setScreenshotLoading(false);
		}
	};

	return { triggerScreenshot, screenshotLoading };
}

export { type ScreenshotResult, useScreenshot };
