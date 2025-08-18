import { allGameConfigs } from '@/features/game/constants';
import {
  defaultTheme,
  defaultThemeDeuteranopia,
  defaultThemeProtanopia,
} from '@/features/theme/themes/default-theme';
import type {
  ToolkitAccentThemeDefinition,
  ToolkitThemeDefinition,
} from '@/features/theme/types';
import type { MantineColorScheme } from '@mantine/core';

export const themeModes: MantineColorScheme[] = ['auto', 'dark', 'light'];

export const themeDefinitions: ToolkitThemeDefinition[] = [
  {
    label: 'Default Light',
    className: 'default-light',
    theme: defaultTheme,
    themeDeuteranopia: defaultThemeDeuteranopia,
    themeProtanopia: defaultThemeProtanopia,
  },
  {
    label: 'Default Dark',
    className: 'default-dark',
    theme: defaultTheme,
    themeDeuteranopia: defaultThemeDeuteranopia,
    themeProtanopia: defaultThemeProtanopia,
  },
].sort((a, b) => a.label.localeCompare(b.label));

const gameThemeDefinitions: ToolkitThemeDefinition[] = allGameConfigs
  .filter((gameConfig) => gameConfig.themeDefinition !== undefined)
  .map((gameConfig) => [
    {
      label: `${gameConfig.themeDefinition?.label} - Light`,
      className: `${gameConfig.themeDefinition?.className}-light`,
      theme: gameConfig.themeDefinition!!.theme,
      themeDeuteranopia: defaultThemeDeuteranopia,
      themeProtanopia: defaultThemeProtanopia,
    },
    {
      label: `${gameConfig.themeDefinition?.label} - Dark`,
      className: `${gameConfig.themeDefinition?.className}-dark`,
      theme: gameConfig.themeDefinition!!.theme,
      themeDeuteranopia: defaultThemeDeuteranopia,
      themeProtanopia: defaultThemeProtanopia,
    },
  ])
  .flat()
  .sort((a, b) => a.label.localeCompare(b.label));

export const accentThemeDefinitions: ToolkitAccentThemeDefinition[] = [
  {
    label: 'Default',
    className: 'accent-default',
    accentTheme: undefined,
  },
  {
    label: 'Deuteranopic',
    className: 'accent-deuteranopic',
    accentTheme: 'deuteranopic',
  },
  {
    label: 'Protanopic',
    className: 'accent-protanopic',
    accentTheme: 'protanopic',
  },
].sort((a, b) => a.label.localeCompare(b.label));

export const allThemeDefinitions = [
  ...themeDefinitions,
  ...gameThemeDefinitions,
];

export const allThemeClassNames = [
  ...themeDefinitions.map((def) => def.className),
  ...gameThemeDefinitions.map((def) => def.className),
].sort();

export const accentThemeClassNames = accentThemeDefinitions
  .filter((def) => def.label !== 'Default')
  .map((def) => def.className)
  .sort();

export const nextThemesDefaultTheme = 'default-dark';
