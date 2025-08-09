import type { MantineColorsTuple } from '@mantine/core';

export type ThemeCustomColors = {
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
};
