import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { allGameConfigs } from '@/features/game/constants';

type ThemeProviderProps = Parameters<typeof NextThemesProvider>[0];

const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  const allThemes = [
    'default',
    'default-dark',
    ...allGameConfigs.map((gameConfig) => gameConfig.themeCSSClass),
    ...allGameConfigs.map((gameConfig) => `${gameConfig.themeCSSClass}-dark`),
  ];

  return (
    <NextThemesProvider
      {...props}
      attribute="class"
      enableSystem
      defaultTheme="default-dark"
      disableTransitionOnChange
      themes={allThemes}
    >
      {children}
    </NextThemesProvider>
  );
};

export { ThemeProvider };
