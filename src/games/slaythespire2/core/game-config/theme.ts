import type { MantineThemeOverride } from "@mantine/core";
import { generateThemeColors } from "#/features/theme/generate-palette.ts";
import { baseTheme } from "#/features/theme/themes/base-theme";
import type { ToolkitThemeDefinition } from "#/features/theme/types.ts";
import { createThemeColors } from "#/features/theme/utils.ts";
import { GAME_ID } from "#/games/slaythespire2/core/constants";

const slayTheSpire2ThemeColors = createThemeColors(
	generateThemeColors({
		primary: "#c49d3d",
		secondary: "#374070",
		accent: "#5f406a",
		sidebar: { dark: "#07080a", light: "#f5f7fa" },
	}),
);

const slayTheSpire2Theme: MantineThemeOverride = {
	...baseTheme,
	colors: {
		...baseTheme.colors,
		...slayTheSpire2ThemeColors,
	},
};

const THEME: ToolkitThemeDefinition = {
	label: "Slay the Spire 2",
	className: GAME_ID,
	theme: slayTheSpire2Theme,
};

export { slayTheSpire2Theme, THEME };
