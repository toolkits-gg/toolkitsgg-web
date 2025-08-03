import type { ThemeMode } from '@/features/theme/constants';
import { useMantineColorScheme } from '@mantine/core';

const useAppTheme = () => {
  const { colorScheme, setColorScheme, toggleColorScheme } =
    useMantineColorScheme();

  const mode: ThemeMode = colorScheme.includes('-light') ? 'light' : 'dark';

  const accent = colorScheme?.includes('-accent')
    ? colorScheme.slice(colorScheme.indexOf('-accent') + 1)
    : 'accent-default';

  const colorTheme = colorScheme?.includes('-accent')
    ? colorScheme.split('-accent')[0]
    : colorScheme;

  const handleChangeTheme = (newColorTheme: string, newAccent: string) => {
    if (newAccent === 'accent-default') {
      const newTheme = newColorTheme.split('-accent-')[0];
      // TODO: setColorScheme(newTheme);
    } else {
      // TODO: setColorScheme(`${newColorTheme}-${newAccent}`);
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
