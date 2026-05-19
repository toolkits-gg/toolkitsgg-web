import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import type { PropsWithChildren } from "react";
import { ScreenshotPreviewProvider } from "#/features/screenshot/core/ScreenshotPreviewProvider";
import { MantineProviderWithTheme } from "#/features/theme/core/MantineProviderWithTheme";

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
