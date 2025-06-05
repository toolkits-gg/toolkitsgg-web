'use client';

import { LucideMoon, LucideSun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

// const isDarkMode = theme?.endsWith('-dark');
// const className = isDarkMode
//   ? `${gameConfig.themeCSSClass}-dark`
//   : gameConfig.themeCSSClass;

// setTheme(className);

const ThemeModeToggle = () => {
  const { theme, setTheme } = useTheme();

  const handleLightMode = () => {
    if (!theme) return;
    // If the current theme has '-dark', remove it
    setTheme(theme.replace('-dark', ''));
  };

  const handleDarkMode = () => {
    if (!theme) return;
    // If the current theme does not have '-dark', append it
    if (theme.indexOf('-dark') === -1) {
      setTheme(`${theme}-dark`);
    }
  };

  const toggleTheme = () => {
    if (!theme) return;

    if (theme.indexOf('-dark') === -1) {
      handleDarkMode();
    } else {
      handleLightMode();
    }
  };

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      <LucideSun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <LucideMoon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle light theme</span>
    </Button>
  );
};

export { ThemeModeToggle };
