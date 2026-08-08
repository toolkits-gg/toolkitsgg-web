import { type MantineColorsTuple, virtualColor } from "@mantine/core";
import { defaultTheme } from "#/features/theme/themes/default-theme";
import type {
	ColorVariants,
	ToolkitThemeColorKey,
	ToolkitThemeColors,
	ToolkitThemeDefinition,
} from "#/features/theme/types";
import {
	getGameTheme,
	REGISTERED_GAME_IDS,
} from "#/games-registry/public-registry";

/**
 * Expands one semantic color into the six entries Mantine needs: an explicit
 * dark and light tuple plus a virtual color that picks between them, and the
 * same three again for the foreground.
 */
function createThemeColor<T extends ToolkitThemeColorKey>(
	name: T,
	colors: ThemeColorInput,
): Pick<ToolkitThemeColors, ColorVariants<T>> {
	const darkKey = `${name}Dark` as const;
	const lightKey = `${name}Light` as const;
	const fgDarkKey = `${name}FgDark` as const;
	const fgLightKey = `${name}FgLight` as const;

	return {
		// Background variants
		[darkKey]: colors.dark,
		[lightKey]: colors.light,
		[name]: virtualColor({
			name,
			dark: darkKey,
			light: lightKey,
		}),

		// Foreground variants
		[fgDarkKey]: colors.fgDark,
		[fgLightKey]: colors.fgLight,
		[`${name}Fg`]: virtualColor({
			name: `${name}Fg`,
			dark: fgDarkKey,
			light: fgLightKey,
		}),
	} as Pick<ToolkitThemeColors, ColorVariants<T>>;
}

/**
 * Input type for creating a theme color with all its variants.
 * Includes color tuples for dark and light modes, both background and foreground.
 */
export type ThemeColorInput = {
	dark: MantineColorsTuple;
	light: MantineColorsTuple;
	fgDark: MantineColorsTuple;
	fgLight: MantineColorsTuple;
};

/** `createThemeColor` across every semantic color, merged into one map. */
export function createThemeColors<T extends ToolkitThemeColorKey>(
	colorDefinitions: Record<T, ThemeColorInput>,
): Record<string, MantineColorsTuple> {
	const result: Record<string, MantineColorsTuple> = {};

	for (const [name, colors] of Object.entries(colorDefinitions) as Array<
		[T, ThemeColorInput]
	>) {
		const colorVariants = createThemeColor(name, colors);
		Object.assign(result, colorVariants);
	}

	return result;
}

/** Theme class names carry their scheme as a suffix; dark is the default. */
export const parseColorScheme = (nextTheme: string | undefined) => {
	if (!nextTheme) return "dark";
	return nextTheme.includes("-light") ? "light" : "dark";
};

// Return an array of all THEME defintions across registered games (for validation, theme switcher dropdowns, etc.)
export const getAllRegisteredThemeDefinitions =
	(): ToolkitThemeDefinition[] => {
		const definitions: ToolkitThemeDefinition[] = [
			{
				label: "Default - Light",
				className: "default-light",
				theme: defaultTheme,
			},
			{
				label: "Default - Dark",
				className: "default-dark",
				theme: defaultTheme,
			},
		];

		for (const gameId of REGISTERED_GAME_IDS) {
			const theme = getGameTheme(gameId);
			if (theme) {
				definitions.push({
					label: `${theme.label} - Light`,
					className: `${theme.className}-light`,
					theme: theme.theme,
				});
				definitions.push({
					label: `${theme.label} - Dark`,
					className: `${theme.className}-dark`,
					theme: theme.theme,
				});
			}
		}
		return definitions;
	};

export const getAllRegisteredThemeClassNames = (): string[] =>
	getAllRegisteredThemeDefinitions()
		.map((def) => def.className)
		.sort();
