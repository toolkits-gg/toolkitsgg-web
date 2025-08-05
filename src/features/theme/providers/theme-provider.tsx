'use client';

import {
  accentThemeClassNames,
  allThemeClassNames,
} from '@/features/theme/constants';
import { defaultTheme } from '@/features/theme/theme';
import { MantineProvider } from '@mantine/core';

const accentThemes = allThemeClassNames
  .map((themeName) =>
    accentThemeClassNames.map((accent) => `${themeName}-${accent}`)
  )
  .flat();

type ThemeProviderProps = React.PropsWithChildren;

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const themes = [...allThemeClassNames, ...accentThemes];

  return (
    <MantineProvider theme={defaultTheme} defaultColorScheme="dark">
      {children}
    </MantineProvider>
  );
};

export { ThemeProvider };
