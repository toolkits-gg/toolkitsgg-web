'use client';

import { LucideMoon, LucidePalette, LucideSun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useIsClient } from 'usehooks-ts';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  const isClient = useIsClient();

  if (!theme) {
    return null;
  }

  if (!isClient) {
    return null;
  }

  const handleLightMode = () => {
    setTheme(theme.replace('-dark', ''));
  };

  const handleDarkMode = () => {
    if (theme.indexOf('-dark') === -1) {
      setTheme(`${theme}-dark`);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">
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
            variant={theme.indexOf('-dark') === -1 ? 'default' : 'ghost'}
            onClick={handleLightMode}
          >
            <LucideSun />
          </Button>
          <Button
            variant={theme.indexOf('-dark') === -1 ? 'ghost' : 'default'}
            onClick={handleDarkMode}
          >
            <LucideMoon />
          </Button>
          {/* <Toggle
            aria-label={
              gameThemeEnabled
                ? 'Disable game-specific themes'
                : 'Enable game-specific themes'
            }
            pressed={gameThemeEnabled}
            onPressedChange={setGameThemeEnabled}
          >
            Game-specific color themes
          </Toggle> */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { ThemeSwitcher };
