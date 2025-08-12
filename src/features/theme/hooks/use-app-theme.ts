import { useMantineColorScheme } from '@mantine/core';
import { useTheme } from 'next-themes';

const useAppTheme = () => {
  const { colorScheme, setColorScheme, toggleColorScheme } =
    useMantineColorScheme();

  const { theme, setTheme } = useTheme();

  const mode: 'dark' | 'light' = colorScheme.includes('-light')
    ? 'light'
    : 'dark';

  const accent = colorScheme?.includes('-accent')
    ? colorScheme.slice(colorScheme.indexOf('-accent') + 1)
    : 'accent-default';

  const colorTheme = colorScheme?.includes('-accent')
    ? colorScheme.split('-accent')[0]
    : colorScheme;

  const handleChangeTheme = (newTheme: string, newAccent: string) => {
    if (newAccent === 'accent-default') {
      const newThemeName = newTheme.split('-accent-')[0];
      setTheme(newThemeName);
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
