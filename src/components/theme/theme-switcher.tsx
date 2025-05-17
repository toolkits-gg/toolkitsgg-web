'use client';

import { LucideMoon, LucidePalette, LucideSun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { themes } from '@/components/theme/constants';
import { ThemeColorButton } from '@/components/theme/theme-color-button';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  const [isLightMode, setIsLightMode] = useState(
    theme?.indexOf('light') !== -1 || false
  );

  const handleLightMode = () => {
    setIsLightMode(true);

    if (!theme) return;

    if (theme.indexOf('-light') === -1) {
      setTheme(`${theme}-light`);
      return;
    }
  };

  const handleDarkMode = () => {
    setIsLightMode(false);
    if (!theme) return;
    setTheme(theme.replace('-light', ''));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <LucidePalette />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change theme</DialogTitle>
          <DialogDescription>Choose your Toolkit experience.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-1 gap-x-2">
          <Button
            variant={isLightMode ? 'secondary' : 'ghost'}
            onClick={handleLightMode}
          >
            <LucideSun />
          </Button>
          <Button
            variant={isLightMode ? 'ghost' : 'secondary'}
            onClick={handleDarkMode}
          >
            <LucideMoon />
          </Button>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          {themes.map(themeName => (
            <ThemeColorButton
              key={`${themeName}-${isLightMode ? 'light' : 'dark'}`}
              themeName={themeName}
              isLightMode={isLightMode}
              onChangeTheme={(themeName: string) => setTheme(themeName)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { ThemeSwitcher };
