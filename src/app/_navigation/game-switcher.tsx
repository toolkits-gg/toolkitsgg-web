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
import { allGameConfigs } from '@/features/game/constants';
import { useActiveGameConfig } from '@/features/game/hooks/useActiveGameConfig';
import type { GameConfig } from '@/features/game/types';

type GameSwitcherProps = {
  gameId?: string;
};

const GameSwitcher = ({ gameId }: GameSwitcherProps) => {
  const { theme, setTheme } = useTheme();
  const { activeGameConfig } = useActiveGameConfig({ gameId });

  const isClient = useIsClient();
  const { isMobile } = useSidebar();

  if (!theme) {
    return null;
  }

  if (!isClient) {
    return null;
  }

  const handleMenuItemClick = (gameConfig: GameConfig) => {
    const isDarkMode = theme.endsWith('-dark');
    const className = isDarkMode
      ? `${gameConfig.themeCSSClass}-dark`
      : gameConfig.themeCSSClass;

    console.info(`Switching to game: ${gameConfig.name} (${gameConfig.id})`);
    console.info(`Setting theme: ${className}`);

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
              <div className="bg-sidebar-primary/15 text-sidebar-primary-foreground flex aspect-square size-9 items-center justify-center rounded-lg">
                {activeGameConfig &&
                  React.cloneElement(activeGameConfig.logo, {
                    className: 'size-8',
                  })}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeGameConfig.name}
                </span>
                <span className="truncate text-xs">---</span>
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
            {Object.values(allGameConfigs).map((gameConfig) => (
              <DropdownMenuItem
                key={gameConfig.name}
                onClick={() => handleMenuItemClick(gameConfig)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  {React.cloneElement(gameConfig.logo, {
                    className: 'size-3.5 shrink-0',
                  })}
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
