'use client';

import { MantineProvider } from '@mantine/core';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import {
  accentThemeClassNames,
  allThemeClassNames,
  nextThemesDefaultTheme,
} from '@/features/theme/constants';
import { useAtom } from 'jotai';
import { mantineThemeAtom } from '@/features/theme/atoms';

const accentThemes = allThemeClassNames
  .map((themeName) =>
    accentThemeClassNames.map((accent) => `${themeName}-${accent}`)
  )
  .flat();

type ThemeProviderProps = React.PropsWithChildren;

const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  const [mantineTheme] = useAtom(mantineThemeAtom);

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
