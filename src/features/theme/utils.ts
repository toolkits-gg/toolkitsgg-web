import { type MantineColorsTuple, virtualColor } from "@mantine/core";
import type {
	ColorVariants,
	ToolkitThemeColorKey,
	ToolkitThemeColors,
} from "#/features/theme/types.ts";

/**
 * Input type for creating a theme color with all its variants.
 * Includes color tuples for dark and light modes, both background and foreground.
 */
type ThemeColorInput = {
	dark: MantineColorsTuple;
	light: MantineColorsTuple;
	fgDark: MantineColorsTuple;
	fgLight: MantineColorsTuple;
};

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
function createThemeColors<T extends ToolkitThemeColorKey>(
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
const parseColorScheme = (nextTheme: string | undefined) => {
	if (!nextTheme) return "dark";
	return nextTheme.includes("-light") ? "light" : "dark";
};

export { createThemeColors, parseColorScheme, type ThemeColorInput };
