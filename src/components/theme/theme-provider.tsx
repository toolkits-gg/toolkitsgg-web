import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { themes } from '@/components/theme/constants';

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
