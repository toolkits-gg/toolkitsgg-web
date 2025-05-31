'use client';

import { LucideMoon, LucidePalette, LucideSun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Toggle } from '@/components/ui/toggle';
import { useLocalStorage } from 'usehooks-ts';
import { allGameConfigs } from '@/features/games/constants';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  const [isLightMode, setIsLightMode] = useState(
    theme?.indexOf('light') !== -1 || false
  );

  const [gameThemeEnabled, setGameThemeEnabled] = useLocalStorage(
    'gameThemeEnabled',
    true
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

  const handleThemeChange = (themeCSSClass: string) => {
    if (isLightMode) {
      setTheme(`${themeCSSClass}-light`);
    } else {
      setTheme(themeCSSClass);
    }
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
          <Toggle
            aria-label={
              gameThemeEnabled
                ? 'Disable game-specific themes'
                : 'Enable game-specific themes'
            }
            pressed={gameThemeEnabled}
            onPressedChange={setGameThemeEnabled}
          >
            Game-specific color themes
          </Toggle>
        </div>
        <div className="text-muted-foreground mt-4 text-sm">
          {allGameConfigs.map((game) => (
            <Button
              key={game.id}
              variant="default"
              onClick={() => handleThemeChange(game.themeCSSClass)}
            >
              {game.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { ThemeSwitcher };
