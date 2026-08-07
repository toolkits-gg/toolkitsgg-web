import { type MantineColorsTuple, virtualColor } from "@mantine/core";
import { defaultTheme } from "#/features/theme/themes/default-theme";
import type {
	ColorVariants,
	ToolkitThemeColorKey,
	ToolkitThemeColors,
	ToolkitThemeDefinition,
} from "#/features/theme/types.ts";
import {
	getGameTheme,
	REGISTERED_GAME_IDS,
} from "#/game-registry/public-registry.ts";

/**
 * Creates a complete set of color variants for a theme color.
 *
 * Generates all 6 variants required for a semantic color:
 * - Background: dark, light, virtual
 * - Foreground: fgDark, fgLight, fgVirtual
 *
 * @param name - The semantic color key (e.g., 'primary', 'border')
 * @param colors - Color tuples for all variants
 * @returns Object with all 6 color variant properties
 *
 * @example
 * ```ts
 * const primaryColors = createThemeColor('primary', {
 *   dark: ['#1a1a1a', ...],
 *   light: ['#ffffff', ...],
 *   fgDark: ['#ffffff', ...],
 *   fgLight: ['#000000', ...],
 * });
 * ```
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

/**
 * Creates theme colors from an object of color definitions.
 * This is a convenience function for creating multiple colors at once.
 *
 * @param colorDefinitions - Object mapping color keys to their color tuples
 * @returns Merged object with all color variants
 *
 * @example
 * ```ts
 * const themeColors = createThemeColors({
 *   primary: {
 *     dark: ['#1a1a1a', ...],
 *     light: ['#ffffff', ...],
 *     fgDark: ['#ffffff', ...],
 *     fgLight: ['#000000', ...],
 *   },
 *   border: {
 *     dark: ['#333333', ...],
 *     light: ['#e5e5e5', ...],
 *     fgDark: ['#cccccc', ...],
 *     fgLight: ['#666666', ...],
 *   },
 * });
 * ```
 */
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

/**
 * Parses the color scheme from the given theme string.
 * @param nextTheme - The current Next.js theme string
 * @returns The parsed color scheme ('light' or 'dark')
 */
export const parseColorScheme = (nextTheme: string | undefined) => {
	if (!nextTheme) return "dark";
	return nextTheme.includes("-light") ? "light" : "dark";
};

// Return an array of all THEME defintions across registered games (for validation, theme switcher dropdowns, etc.)
export const getAllRegisteredThemeDefinitions =
	(): ToolkitThemeDefinition[] => {
		const definitions: ToolkitThemeDefinition[] = [
			{
				label: "Default Light",
				className: "default-light",
				theme: defaultTheme,
			},
			{
				label: "Default Dark",
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
