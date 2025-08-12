import { allGameConfigs } from '@/features/game/constants';
import { defaultTheme } from '@/features/theme/themes/default-theme';
import type {
  ToolkitAccentThemeDefinition,
  ToolkitThemeDefinition,
} from '@/features/theme/types';

export const themeModes = ['All', 'Dark', 'Light'] as const;

export const themeDefinitions: ToolkitThemeDefinition[] = [
  {
    label: 'Default Light',
    className: 'default-light',
    theme: defaultTheme,
  },
  {
    label: 'Default Dark',
    className: 'default-dark',
    theme: defaultTheme,
  },
].sort((a, b) => a.label.localeCompare(b.label));

const gameThemeDefinitions: ToolkitThemeDefinition[] = allGameConfigs
  .filter((gameConfig) => gameConfig.themeDefinition !== undefined)
  .map((gameConfig) => ({ ...gameConfig.themeDefinition! }))
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

export const allThemeClassDefinitions: Array<
  ToolkitThemeDefinition | ToolkitAccentThemeDefinition
> = [...themeDefinitions, ...gameThemeDefinitions].sort();

export const allThemeClassNames = allThemeClassDefinitions
  .map((def) => def.className)
  .sort();

export const accentThemeClassNames = accentThemeDefinitions
  .filter((def) => def.label !== 'Default')
  .map((def) => def.className)
  .sort();

export const nextThemesDefaultTheme = 'default-dark';
