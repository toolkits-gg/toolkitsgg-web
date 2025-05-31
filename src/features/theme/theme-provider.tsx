import { allGameConfigs } from '@/features/games/constants';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

type ThemeProviderProps = Parameters<typeof NextThemesProvider>[0];

const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  return (
    <NextThemesProvider
      {...props}
      attribute="class"
      enableSystem
      defaultTheme="default"
      themes={[
        ...allGameConfigs.map((gameConfig) => gameConfig.themeCSSClass),
        ...allGameConfigs.map(
          (gameConfig) => `${gameConfig.themeCSSClass}-light`
        ),
      ]}
    >
      {children}
    </NextThemesProvider>
  );
};

export { ThemeProvider };
