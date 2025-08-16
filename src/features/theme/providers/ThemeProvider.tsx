'use client';

import { defaultTheme } from '@/features/theme/themes/default-theme';
import { MantineProvider, type MantineThemeOverride } from '@mantine/core';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import {
  accentThemeClassNames,
  allThemeClassNames,
  nextThemesDefaultTheme,
} from '@/features/theme/constants';
import { usePathname } from 'next/navigation';
import { allGameConfigs } from '@/features/game/constants';
import { useAtom } from 'jotai';
import { mantineThemeAtom } from '@/features/theme/atoms';

const accentThemes = allThemeClassNames
  .map((themeName) =>
    accentThemeClassNames.map((accent) => `${themeName}-${accent}`)
  )
  .flat();

type ThemeProviderProps = React.PropsWithChildren;

const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  const pathname = usePathname();

  const gameConfig = allGameConfigs.find((gameConfig) =>
    pathname.includes(gameConfig.id)
  );

  const [mantineTheme, setMantineTheme] = useAtom(mantineThemeAtom);

  if (gameConfig && gameConfig.themeDefinition) {
    setMantineTheme(gameConfig.themeDefinition.theme);
  }

  const themes = [...allThemeClassNames, ...accentThemes];

  return (
    <NextThemesProvider
      {...props}
      enableSystem
      enableColorScheme={false} // not playing nice with the extra themes
      defaultTheme={nextThemesDefaultTheme}
      disableTransitionOnChange
      themes={themes}
    >
      <MantineProvider theme={mantineTheme} defaultColorScheme="dark">
        {children}
      </MantineProvider>
    </NextThemesProvider>
  );
};

export { ThemeProvider };
