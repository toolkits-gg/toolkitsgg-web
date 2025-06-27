import { useTheme } from 'next-themes';
import { useState } from 'react';
import { type ThemeMode } from '@/features/theme/constants';

// TODO Theme and Category boxes need to follow the selected values

const getThemeName = (
  theme: string | undefined,
  accent: string | undefined
) => {
  if (!theme || !accent) {
    return '';
  }

  // Remove the accent if any exist
  const cleanThemeName = theme.split('-accent')[0];
  return accent === 'accent-default'
    ? cleanThemeName
    : `${cleanThemeName}-${accent}`;
};

const useAppTheme = () => {
  const { theme, setTheme } = useTheme();

  const [selectedMode, setSelectedMode] = useState<ThemeMode>(
    theme?.includes('-dark') ? 'dark' : 'light'
  );

  const handleChangeMode = (newMode: ThemeMode) => {
    setSelectedMode(newMode);
  };

  const [selectedAccent, setSelectedAccent] = useState<string>(
    theme?.includes('accent-')
      ? theme.split('accent-')[1].split(' ')[0]
      : 'accent-default'
  );

  const handleChangeAccent = (newAccent: string | undefined) => {
    const newTheme = getThemeName(theme, newAccent);
    setTheme(newTheme);
    setSelectedAccent(newAccent || 'accent-default');
  };

  const handleChangeTheme = (newTheme: string) => {
    const newThemeWithAccent = getThemeName(newTheme, selectedAccent);
    setTheme(newThemeWithAccent);
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
