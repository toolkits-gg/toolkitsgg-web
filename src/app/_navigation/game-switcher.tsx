'use client';

import { ChevronsUpDown } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useTheme } from 'next-themes';
import * as React from 'react';
import { useIsClient } from 'usehooks-ts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { allGameConfigs } from '@/features/game/constants';
import { noGameConfig } from '@/features/game/games/no-game-config';
import { useActiveGameConfig } from '@/features/game/hooks/use-active-game-config';
import type { GameConfig, GameId } from '@/features/game/types';

type GameSwitcherProps = {
  gameId: GameId | undefined;
};

const GameSwitcher = ({ gameId }: GameSwitcherProps) => {
  const { theme, setTheme } = useTheme();

  const { activeGameConfig } = useActiveGameConfig({
    gameId,
  });

  const isClient = useIsClient();
  const { isMobile } = useSidebar();

  if (!theme) {
    return <Skeleton className="h-12 w-full" />;
  }

  if (!isClient) {
    return <Skeleton className="h-12 w-full" />;
  }

  const handleMenuItemClick = (gameConfig: GameConfig) => {
    const isDarkMode = theme.endsWith('-dark');
    const className = isDarkMode
      ? `${gameConfig.themeCSSClass}-dark`
      : gameConfig.themeCSSClass;

    setTheme(className);
    redirect(`${gameConfig.id}`);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-background/25 hover:bg-background/75 text-sidebar-primary-foreground flex aspect-square size-10 items-center justify-center rounded-lg p-0.5">
                {activeGameConfig.logo}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeGameConfig.name}
                </span>
                <span className="truncate text-xs">
                  {activeGameConfig.path === noGameConfig.path
                    ? '---'
                    : activeGameConfig.path}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Games
            </DropdownMenuLabel>
            {allGameConfigs
              .filter((gameConfig) => gameConfig.id !== noGameConfig.id)
              .map((gameConfig) => (
                <DropdownMenuItem
                  key={gameConfig.name}
                  onClick={() => handleMenuItemClick(gameConfig)}
                  className="gap-2 p-2"
                >
                  <div className="bg-background/25 text-primary-foreground flex size-8 items-center justify-center rounded-md border">
                    {gameConfig.logo}
                  </div>
                  {gameConfig.name}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export { GameSwitcher };
