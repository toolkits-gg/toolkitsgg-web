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

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Needed fix for Firefox screenshot rendering.
 *
 * modern-screenshot decides which computed styles to inline by diffing each node
 * against a bare element rendered in a sandbox iframe. Gecko reports initial
 * values rather than UA-stylesheet values for that probe, so a declaration such
 * as `p { margin: 0 }` from our reset looks identical to the default and gets
 * dropped. The cloned SVG then falls back to the UA stylesheet's `margin: 1em 0`
 * on every paragraph, inflating the card until its content collides with the
 * watermark. Re-establishing the reset inside the clone restores the baseline
 * Gecko assumed; inlined declarations still win, so engines that copy correctly
 * are unaffected.
 */
const applyCloneStyleReset = (svg: SVGSVGElement) => {
	const style = svg.ownerDocument.createElementNS(SVG_NS, "style");
	style.textContent = "*{margin:0;padding:0;}";
	svg.insertBefore(style, svg.firstChild);
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
						onCreateForeignObjectSvg: applyCloneStyleReset,
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
