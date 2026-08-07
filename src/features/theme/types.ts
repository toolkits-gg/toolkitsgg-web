import type {
	DefaultMantineColor,
	MantineColorsTuple,
	MantineThemeOverride,
} from "@mantine/core";

/**
 * Base color keys used throughout the toolkit
 * Each key represents a semantic purpose (e.g., 'primary', 'border', 'input').
 *
 * For each key, the theme system generates:
 * - `{key}Dark` - Color tuple for dark mode
 * - `{key}Light` - Color tuple for light mode
 * - `{key}` - Virtual color that switches between dark/light
 * - `{key}FgDark` - Foreground color tuple for dark mode
 * - `{key}FgLight` - Foreground color tuple for light mode
 * - `{key}Fg` - Virtual foreground color
 */
type ToolkitThemeColorKey =
	| "primary"
	| "secondary"
	| "accent"
	| "base"
	| "card"
	| "popover"
	| "muted"
	| "destructive"
	| "border"
	| "input"
	| "ring"
	| "sidebar";

/**
 * Generates all color variant keys for a given base color key.
 *
 * For example, 'primary' generates:
 * - primaryDark, primaryLight, primary (background variants)
 * - primaryFgDark, primaryFgLight, primaryFg (foreground variants)
 */
type ColorVariants<T extends string> =
	| `${T}Dark`
	| `${T}Light`
	| T
	| `${T}FgDark`
	| `${T}FgLight`
	| `${T}Fg`;

/**
 * Union of all possible color keys including variants.
 * This type is used in the Mantine theme override.
 */
type ToolkitThemeColorName =
	| ColorVariants<ToolkitThemeColorKey>
	| DefaultMantineColor;

/**
 * Type-safe definition of all theme colors.
 *
 * For custom colors, Mantine provides a feature called a virtual color.
 * You pass in a light color and a dark color, and it will adjust accordingly.
 *
 * However, the light color and dark color passed in need to be an existing
 * Mantine color.
 *
 * For this reason, we define three values for each semantic color:
 * - The dark variant (e.g., 'primaryDark')
 * - The light variant (e.g., 'primaryLight')
 * - The virtual color (e.g., 'primary') - this is the one used in core
 *
 * Additionally, each color has foreground variants for text/icon colors:
 * - The dark foreground (e.g., 'primaryFgDark')
 * - The light foreground (e.g., 'primaryFgLight')
 * - The virtual foreground (e.g., 'primaryFg')
 */
type ToolkitThemeColors = {
	[K in ColorVariants<ToolkitThemeColorKey>]: MantineColorsTuple;
};

type ToolkitThemeDefinition = {
	label: string;
	className: string;
	theme: MantineThemeOverride;
};

export type {
	ColorVariants,
	ToolkitThemeColorKey,
	ToolkitThemeColorName,
	ToolkitThemeColors,
	ToolkitThemeDefinition,
};
