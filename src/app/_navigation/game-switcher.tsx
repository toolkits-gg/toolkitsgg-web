'use client';

import type { GameId } from '@prisma/client';
import { ChevronsUpDown } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
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
import { noGameConfig } from '@/features/game/games/no-game-config';
import { useActiveGameConfig } from '@/features/game/hooks/use-active-game-config';

type GameSwitcherProps = {
  gameId: GameId | undefined;
};

const GameSwitcher = ({ gameId }: GameSwitcherProps) => {
  const { activeGameConfig } = useActiveGameConfig({
    gameId,
  });

  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex flex-1"
            >
              <div className="text-sidebar-primary-foreground flex aspect-square size-14 items-center justify-center rounded-lg">
                {activeGameConfig.logo}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeGameConfig.path === noGameConfig.path
                    ? activeGameConfig.name
                    : activeGameConfig.label}
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
            className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-lg"
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
                <DropdownMenuItem key={gameConfig.name}>
                  <Link
                    href={`${gameConfig.path}`}
                    className="flex flex-1 items-center gap-2"
                  >
                    <div className="text-primary-foreground flex size-10 items-center justify-center">
                      {gameConfig.logo}
                    </div>
                    <span className="text-md font-medium">
                      {gameConfig.name}
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export { GameSwitcher };
