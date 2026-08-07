import type { MantineThemeOverride } from "@mantine/core";
import { generateThemeColors } from "#/features/theme/generate-palette.ts";
import { baseTheme } from "#/features/theme/themes/base-theme";
import type { ToolkitThemeDefinition } from "#/features/theme/types.ts";
import { createThemeColors } from "#/features/theme/utils.ts";
import { GAME_ID } from "#/games/clairobscur/core/constants";

const clairObscurThemeColors = createThemeColors(
	generateThemeColors({
		primary: "#3380ff",
		secondary: "#f8b46d",
		accent: "#34a85a",
		ring: "accent",
		sidebar: { dark: "#1f2530" },
	}),
);

const clairObscurTheme: MantineThemeOverride = {
	...baseTheme,
	colors: {
		...baseTheme.colors,
		...clairObscurThemeColors,
	},
};

const THEME: ToolkitThemeDefinition = {
	label: "Clair Obscur",
	className: GAME_ID,
	theme: clairObscurTheme,
};

export { clairObscurTheme, THEME };
