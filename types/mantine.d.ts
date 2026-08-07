import type { Tuple } from "@mantine/core";

import type { ToolkitThemeColorName } from "#/features/theme/types/toolkit-theme-colors";

declare module "@mantine/core" {
	export interface MantineThemeColorsOverride {
		colors: Record<ToolkitThemeColorName, Tuple<string, 10>>;
	}
}
