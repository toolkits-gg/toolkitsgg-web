import { ThemeProvider as NextThemesProvider } from 'next-themes';
import {
  accentThemeClassNames,
  allThemeClassNames,
  defaultTheme,
} from '@/features/theme/constants';
import { MantineProvider } from '@mantine/core';

const accentThemes = allThemeClassNames
  .map((themeName) =>
    accentThemeClassNames.map((accent) => `${themeName}-${accent}`)
  )
  .flat();

type ThemeProviderProps = Parameters<typeof NextThemesProvider>[0];

const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  const themes = [...allThemeClassNames, ...accentThemes];

  return (
    <NextThemesProvider
      {...props}
      enableSystem
      enableColorScheme={false} // not playing nice with the extra themes
      defaultTheme={defaultTheme}
      disableTransitionOnChange
      themes={themes}
    >
      <MantineProvider>{children}</MantineProvider>
    </NextThemesProvider>
  );
};

export { ThemeProvider };
