import { allGameConfigs } from '@/features/games/constants';
import type { GameConfigKey } from '@/features/games/types';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

const themes = Object.keys(allGameConfigs).map(
  (key) => allGameConfigs[key as GameConfigKey].themeCSSClass
);

type ThemeProviderProps = Parameters<typeof NextThemesProvider>[0];

const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  return (
    <NextThemesProvider
      {...props}
      attribute="class"
      enableSystem
      defaultTheme="default"
      themes={[...themes, ...themes.map((theme) => `${theme}-light`)]}
    >
      {children}
    </NextThemesProvider>
  );
};

export { ThemeProvider };
