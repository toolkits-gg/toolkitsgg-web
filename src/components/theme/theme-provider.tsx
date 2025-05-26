import {
  ALL_GAME_CONFIGS,
  type GameConfigKey,
} from '@/features/games/constants';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

const themes = Object.keys(ALL_GAME_CONFIGS).map(
  (key) => ALL_GAME_CONFIGS[key as GameConfigKey].themeCSSClass
);

type ThemeProviderProps = Parameters<typeof NextThemesProvider>[0];

const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  return (
    <NextThemesProvider
      {...props}
      attribute="class"
      enableSystem
      defaultTheme="clair-obscur"
      themes={[...themes, ...themes.map((theme) => `${theme}-light`)]}
    >
      {children}
    </NextThemesProvider>
  );
};

export { ThemeProvider };
