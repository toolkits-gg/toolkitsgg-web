'use client';

import { LucidePalette } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Toggle } from '@/components/ui/toggle';
import { allGameConfigs } from '@/features/game/constants';
import { useAppTheme } from '@/features/theme/hooks/use-theme';

const ThemeSwitcher = () => {
  const isClient = useIsClient();

  const { theme, gameThemeEnabled, setGameThemeEnabled, handleChangeTheme } =
    useAppTheme();

  if (!theme) {
    return <Skeleton className="h-9 w-9" />;
  }

  if (!isClient) {
    return <Skeleton className="h-9 w-9" />;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Change theme">
          <LucidePalette />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change theme</DialogTitle>
          <DialogDescription>Choose your Toolkit experience.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-1 gap-x-2">
          <Toggle
            variant="default"
            aria-label={
              gameThemeEnabled
                ? 'Game-specific themes: Enabled'
                : 'Game-specific themes: Disabled'
            }
            pressed={gameThemeEnabled}
            onPressedChange={setGameThemeEnabled}
          >
            Game-specific themes
          </Toggle>

          <Select
            disabled={gameThemeEnabled}
            onValueChange={handleChangeTheme}
            value={
              theme.indexOf('default') !== -1
                ? 'none'
                : theme.replace(/-dark$/, '')
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Game Theme</SelectLabel>
                {allGameConfigs.map((gameConfig) => (
                  <SelectItem key={gameConfig.id} value={gameConfig.id}>
                    {gameConfig.id === 'none'
                      ? `Default Theme`
                      : `${gameConfig.name}`}
                  </SelectItem>
                ))}
              </SelectGroup>
              {/* <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem> */}
            </SelectContent>
          </Select>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { ThemeSwitcher };
