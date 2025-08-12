import { defaultTheme } from '@/features/theme/themes/default-theme';
import { MantineProvider } from '@mantine/core';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import {
  accentThemeClassNames,
  allThemeClassNames,
  nextThemesDefaultTheme,
} from '@/features/theme/constants';

const accentThemes = allThemeClassNames
  .map((themeName) =>
    accentThemeClassNames.map((accent) => `${themeName}-${accent}`)
  )
  .flat();

type ThemeProviderProps = React.PropsWithChildren;

const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
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
      <MantineProvider theme={defaultTheme} defaultColorScheme="dark">
        {children}
      </MantineProvider>
    </NextThemesProvider>
  );
};

export { ThemeProvider };
