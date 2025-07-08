import { allGameConfigs } from '@/features/game/constants';

export const themeModes = ['All', 'Dark', 'Light'] as const;
export type ThemeMode = 'dark' | 'light';

export type ThemeDefinition = {
  label: string;
  className: string;
};

export type AccentThemeDefinition = {
  label: string;
  className: string;
  accentTheme: string | undefined;
};

export const themeDefinitions: ThemeDefinition[] = [
  {
    label: 'Default Light',
    className: 'default-light',
  },
  {
    label: 'Default Dark',
    className: 'default-dark',
  },
  // TODO: Add all the shadcn specific variants for the below themes
  // TODO: Things like --sidebar-background, etc. See Default Themes for reference.

  // {
  //   label: 'Nord Polar',
  //   className: 'nord-polar-dark',
  // },
  // {
  //   label: 'Nord Snow',
  //   className: 'nord-snow-light',
  // },
  // {
  //   label: 'Solarized Dark',
  //   className: 'solarized-dark',
  // },
  // {
  //   label: 'Solarized Light',
  //   className: 'solarized-light',
  // },
].sort((a, b) => a.label.localeCompare(b.label));

const gameThemeDefinitions: ThemeDefinition[] = allGameConfigs
  .filter((gameConfig) => gameConfig.themeDefinitions)
  .flatMap(
    (gameConfig) =>
      gameConfig.themeDefinitions?.map((def) => ({
        label: def.label,
        className: def.className,
      })) ?? []
  )
  .sort((a, b) => a.label.localeCompare(b.label));

export const accentThemeDefinitions: AccentThemeDefinition[] = [
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
  ThemeDefinition | AccentThemeDefinition
> = [...themeDefinitions, ...gameThemeDefinitions].sort();

export const allThemeClassNames = allThemeClassDefinitions
  .map((def) => def.className)
  .sort();

export const accentThemeClassNames = accentThemeDefinitions
  .filter((def) => def.label !== 'Default')
  .map((def) => def.className)
  .sort();

export const defaultTheme = 'default-dark';
