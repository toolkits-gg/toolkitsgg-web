import { useTheme } from 'next-themes';
import { useState } from 'react';
import { type ThemeMode } from '@/features/theme/constants';

const useAppTheme = () => {
  const { theme, setTheme } = useTheme();

  const [selectedMode, setSelectedMode] = useState<ThemeMode>(
    theme?.includes('-dark') ? 'dark' : 'light'
  );

  const handleChangeMode = (newMode: ThemeMode) => {
    setSelectedMode(newMode);
  };

  const [selectedAccent, setSelectedAccent] = useState<string | undefined>(
    theme?.includes('accent-') ? theme.split('accent-').at(-1) : undefined
  );

  const handleChangeAccent = (newAccent: string | undefined) => {
    setSelectedAccent(newAccent);
  };

  const handleChangeTheme = (newThemeClass: string) => {
    setTheme(newThemeClass);
  };

  return {
    theme,
    selectedAccent,
    selectedMode,
    handleChangeAccent,
    handleChangeMode,
    handleChangeTheme,
  };
};

export { useAppTheme };
