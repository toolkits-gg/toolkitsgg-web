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
import { useTheme } from 'next-themes';
import type { GameConfig, GameConfigKey } from '@/features/games/types';
import { allGameConfigs } from '@/features/games/constants';
import { redirect, useSearchParams } from 'next/navigation';
import { logosPath } from '@/paths';
import Image from 'next/image';

const defaultConfig: GameConfig = {
  id: 'default',
  name: 'Select a game',
  themeCSSClass: 'default',
  logo: (
    <Image
      src={`${logosPath()}/256Clean.png`}
      alt="Default Toolkits.gg logo"
      width={256}
      height={256}
    />
  ),
};

type GameSwitcherProps = {
  game?: GameConfigKey;
};

const GameSwitcher = ({ game }: GameSwitcherProps) => {
  const activeGameConfig = React.useMemo(() => {
    if (!game || !allGameConfigs[game as GameConfigKey]) {
      return defaultConfig;
    }
    return allGameConfigs[game as GameConfigKey];
  }, [game]);

  const { setTheme } = useTheme();
  React.useEffect(() => {
    setTheme(activeGameConfig.themeCSSClass);
  }, [activeGameConfig.themeCSSClass]);

  const { isMobile } = useSidebar();

  const handleMenuItemClick = (gameConfig: GameConfig) => {
    setTheme(gameConfig.themeCSSClass);
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
              Teams
            </DropdownMenuLabel>
            {Object.values(allGameConfigs).map((gameConfig, index) => (
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
