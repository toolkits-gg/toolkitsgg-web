import { allGameThemeCSSClasses } from '@/features/games/constants';
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
        ...allGameThemeCSSClasses,
        ...allGameThemeCSSClasses.map((theme) => `${theme}-light`),
      ]}
    >
      {children}
    </NextThemesProvider>
  );
};

export { ThemeProvider };
