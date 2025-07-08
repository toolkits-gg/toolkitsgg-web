import { useTheme } from 'next-themes';
import type { ThemeMode } from '@/features/theme/constants';

const useAppTheme = () => {
  const { theme, setTheme } = useTheme();

  const mode: ThemeMode = theme?.includes('-light') ? 'light' : 'dark';

  const accent = theme?.includes('-accent')
    ? theme.slice(theme.indexOf('-accent') + 1)
    : 'accent-default';

  const colorTheme = theme?.includes('-accent')
    ? theme.split('-accent')[0]
    : theme;

  const handleChangeTheme = (newColorTheme: string, newAccent: string) => {
    if (newAccent === 'accent-default') {
      setTheme(newColorTheme.split('-accent-')[0]);
    } else {
      setTheme(`${newColorTheme}-${newAccent}`);
    }
  };

  return {
    colorTheme,
    accent,
    mode,
    handleChangeTheme,
  };
};

export { useAppTheme };
