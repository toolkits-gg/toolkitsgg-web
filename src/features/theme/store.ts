import type { MantineThemeOverride } from "@mantine/core";
import { useSelector } from "@tanstack/react-store";
import { Store } from "@tanstack/store";

import { defaultTheme } from "#/features/theme/themes/default-theme.ts";

type ThemeState = {
	theme: MantineThemeOverride;
};

const themeStore = new Store<ThemeState>({ theme: defaultTheme });

function changeMantineTheme(newTheme: MantineThemeOverride) {
	themeStore.setState(() => ({ theme: newTheme }));
}

function useMantineThemeStore<T>(selector: (state: ThemeState) => T): T {
	return useSelector(themeStore, selector);
}

export { changeMantineTheme, themeStore, useMantineThemeStore };
