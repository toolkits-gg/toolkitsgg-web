import type { MantineColorsTuple, MantineThemeOverride } from '@mantine/core';

/**
 * For custom colors, Mantine providers a feature called a virtual color.
 * You pass in a light color and a dark color, and it will adjust accordingly.
 *
 * However, the light color and dark color passed in need to be an existing
 * Mantine color.
 *
 * For this reason, we define three values for a custom color:
 *  - The dark color
 *  - The light color
 *  - The virtual color (this is the only value that ends up in use)
 */
export type ThemeCustomColors = {
  /**
   * ! IMPORTANT !
   * ! Any new custom colors must also be added to mantine.d.ts for !
   * ! Typescript completions !
   */

  /**
   * Colors
   */
  primaryDark: MantineColorsTuple;
  primaryLight: MantineColorsTuple;
  primary: MantineColorsTuple;

  secondaryDark: MantineColorsTuple;
  secondaryLight: MantineColorsTuple;
  secondary: MantineColorsTuple;

  accent1Dark: MantineColorsTuple;
  accent1Light: MantineColorsTuple;
  accent1: MantineColorsTuple;

  /**
   * Surfaces
   */
  bgDark: MantineColorsTuple;
  bgLight: MantineColorsTuple;
  bg: MantineColorsTuple;

  cardBgDark: MantineColorsTuple;
  cardBgLight: MantineColorsTuple;
  cardBg: MantineColorsTuple;

  sidebarBgDark: MantineColorsTuple;
  sidebarBgLight: MantineColorsTuple;
  sidebarBg: MantineColorsTuple;

  /**
   * Borders
   */
  borderDark: MantineColorsTuple;
  borderLight: MantineColorsTuple;
  border: MantineColorsTuple;

  ringDark: MantineColorsTuple;
  ringLight: MantineColorsTuple;
  ring: MantineColorsTuple;

  /**
   * Inputs
   */
  inputDark: MantineColorsTuple;
  inputLight: MantineColorsTuple;
  input: MantineColorsTuple;
};

export type ToolkitAccentThemeClassName =
  | 'accent-default'
  | 'accent-deuteranopic'
  | 'accent-protanopic';

export type ToolkitThemeDefinition = {
  label: string;
  className: string;
  theme: MantineThemeOverride;
  themeDeuteranopia: MantineThemeOverride;
  themeProtanopia: MantineThemeOverride;
};

export type ToolkitAccentThemeDefinition = {
  label: string;
  className: ToolkitAccentThemeClassName;
  accentTheme: string | undefined;
};
