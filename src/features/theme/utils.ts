import type { MantineThemeOverride } from '@mantine/core';
import { allGameConfigs } from '@/features/game/constants';
import {
  defaultTheme,
  defaultThemeDeuteranopia,
  defaultThemeProtanopia,
} from '@/features/theme/themes/default-theme';

const chooseMantineTheme = ({
  nextTheme,
  accent,
}: {
  nextTheme: string | undefined;
  accent: string;
}): MantineThemeOverride => {
  const gameConfig = allGameConfigs.find((gameConfig) =>
    gameConfig.themeDefinition?.className
      ? nextTheme?.includes(gameConfig.themeDefinition?.className)
      : undefined
  );

  if (!gameConfig || !gameConfig.themeDefinition?.theme) {
    if (accent === 'accent-deuteranopic') {
      return defaultThemeDeuteranopia;
    }

    if (accent === 'accent-protanopic') {
      return defaultThemeProtanopia;
    }

    return defaultTheme;
  }

  if (accent === 'accent-deuteranopic') {
    return gameConfig.themeDefinition.themeDeuteranopia;
  }

  if (accent === 'accent-protanopic') {
    return gameConfig.themeDefinition.themeProtanopia;
  }

  return gameConfig.themeDefinition.theme;
};

const parseAccent = ({ nextTheme }: { nextTheme: string | undefined }) => {
  return nextTheme?.includes('-accent')
    ? nextTheme.slice(nextTheme.indexOf('-accent') + 1)
    : 'accent-default';
};

export const themeUtils = {
  chooseMantineTheme,
  parseAccent,
};
