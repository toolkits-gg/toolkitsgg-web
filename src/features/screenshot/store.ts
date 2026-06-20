import { useSelector } from "@tanstack/react-store";
import { Store } from "@tanstack/store";

type ScreenshotPreviewState = {
	screenshot: string | null;
	screenshotLoading: boolean;
	error: string | null;
	opened: boolean;
	title?: string;
};

const initialState: ScreenshotPreviewState = {
	screenshot: null,
	screenshotLoading: false,
	error: null,
	opened: false,
	title: undefined,
};

const screenshotPreviewStore = new Store<ScreenshotPreviewState>(initialState);

function openPreview(options?: {
	screenshot?: string | null;
	screenshotLoading?: boolean;
	error?: string | null;
	title?: string;
}) {
	screenshotPreviewStore.setState((state) => ({
		...state,
		opened: true,
		screenshot: options?.screenshot ?? state.screenshot,
		screenshotLoading: options?.screenshotLoading ?? false,
		error: options?.error ?? null,
		title: options?.title ?? state.title,
	}));
}

function closePreview() {
	screenshotPreviewStore.setState((state) => ({ ...state, opened: false }));
}

function setScreenshot(screenshot: string | null) {
	screenshotPreviewStore.setState((state) => ({ ...state, screenshot }));
}

function setScreenshotLoading(screenshotLoading: boolean) {
	screenshotPreviewStore.setState((state) => ({ ...state, screenshotLoading }));
}

function setError(error: string | null) {
	screenshotPreviewStore.setState((state) => ({ ...state, error }));
}

function setTitle(title?: string) {
	screenshotPreviewStore.setState((state) => ({ ...state, title }));
}

function clearPreview() {
	screenshotPreviewStore.setState((state) => ({
		...state,
		screenshot: null,
		error: null,
		screenshotLoading: false,
	}));
}

const useScreenshotPreviewStore = () => {
	const store = useSelector(screenshotPreviewStore, (s) => s);

	return {
		openPreview,
		closePreview,
		clearPreview,
		setScreenshot,
		setScreenshotLoading,
		setError,
		setTitle,
		...store,
	};
};

export { type ScreenshotPreviewState, useScreenshotPreviewStore };
