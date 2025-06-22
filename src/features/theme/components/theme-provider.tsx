import { ThemeProvider as NextThemesProvider } from 'next-themes';
import {
  accentThemeClassNames,
  allThemeClassNames,
  defaultTheme,
} from '@/features/theme/constants';

type ThemeProviderProps = Parameters<typeof NextThemesProvider>[0];

const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  return (
    <NextThemesProvider
      {...props}
      enableSystem
      defaultTheme={defaultTheme}
      disableTransitionOnChange
      themes={[...allThemeClassNames, ...accentThemeClassNames]}
    >
      {children}
    </NextThemesProvider>
  );
};

export { ThemeProvider };
