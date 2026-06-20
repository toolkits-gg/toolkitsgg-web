import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import type { PropsWithChildren } from "react";
import { ScreenshotPreviewProvider } from "#/features/screenshot/ScreenshotPreviewProvider.tsx";
import { MantineProviderWithTheme } from "#/features/theme/MantineProviderWithTheme.tsx";

const AppProviders = ({ children }: PropsWithChildren) => {
	return (
		<NuqsAdapter>
			<MantineProviderWithTheme>
				<ScreenshotPreviewProvider />
				{children}
			</MantineProviderWithTheme>
		</NuqsAdapter>
	);
};

export { AppProviders };
