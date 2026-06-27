import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import {type PropsWithChildren, useEffect} from "react";
import { ScreenshotPreviewProvider } from "#/features/screenshot/ScreenshotPreviewProvider.tsx";
import {useMantineThemeStore} from "#/features/theme/store.ts";
import {DEFAULT_NEXT_THEME} from "#/features/theme/constants.ts";
import {MantineProvider} from "@mantine/core";
import {SyncAndApplyTheme} from "#/features/theme/SyncAndApplyTheme.ts";
import {Notifications} from "@mantine/notifications";
import {ModalsProvider} from "@mantine/modals";
import {ThemeProvider as NextThemesProvider} from "next-themes";
import {getAllRegisteredThemeClassNames, isRegisteredGameId} from "#/features/game/registry/game-registry.tsx";
import {useGameId} from "#/features/game/use-game-id.ts";

const FAVICON_BASE_PATH = "/favicons/";
const ALL_THEME_CLASS_NAMES: string[] = getAllRegisteredThemeClassNames();
const SyncFavicon = () => {
	const gameId = useGameId();

	useEffect(() => {
		const key =
			gameId !== "none" && isRegisteredGameId(gameId) ? gameId : "default";

		document
			.querySelectorAll<HTMLLinkElement>(
				'link[rel="icon"], link[rel="apple-touch-icon"]',
			)
			.forEach((link) => {
				link.href = link.href.replace(
					new RegExp(`${FAVICON_BASE_PATH}[^/]+/`),
					`${FAVICON_BASE_PATH}${key}/`,
				);
			});
	}, [gameId]);

	return null;
};

const AppProviders = ({ children }: PropsWithChildren) => {
	const mantineTheme = useMantineThemeStore((state) => state.theme);

	return (
		<NuqsAdapter>
			<NextThemesProvider
				enableSystem
				enableColorScheme={false} // not playing nice with the extra themes
				defaultTheme={DEFAULT_NEXT_THEME}
				disableTransitionOnChange
				themes={ALL_THEME_CLASS_NAMES}
			>
				<MantineProvider
					theme={mantineTheme}
					defaultColorScheme="dark"
					deduplicateCssVariables
				>
					<SyncAndApplyTheme />
					<SyncFavicon />
					<Notifications />
					<ScreenshotPreviewProvider />
					<ModalsProvider />
					{children}
				</MantineProvider>
			</NextThemesProvider>
		</NuqsAdapter>
	);
};

export { AppProviders };
