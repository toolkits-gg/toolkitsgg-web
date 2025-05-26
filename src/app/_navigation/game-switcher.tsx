'use client';

import { ChevronsUpDown, Plus } from 'lucide-react';
import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { ALL_GAME_CONFIGS } from '@/features/games/constants';
import { useTheme } from 'next-themes';
import type { GameConfig } from '@/features/games/types';

const GameSwitcher = () => {
  const { theme, setTheme } = useTheme();

  const { isMobile } = useSidebar();

  const [activeGameConfig, setActiveGameConfig] = React.useState(
    ALL_GAME_CONFIGS.clairObscur
  );

  if (!activeGameConfig) {
    return null;
  }

  const handleMenuItemClick = (gameConfig: GameConfig) => {
    setActiveGameConfig(gameConfig);
    setTheme(gameConfig.themeCSSClass);
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
                {React.cloneElement(activeGameConfig.logo, {
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
              Teams
            </DropdownMenuLabel>
            {Object.values(ALL_GAME_CONFIGS).map((gameConfig, index) => (
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
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export { GameSwitcher };
