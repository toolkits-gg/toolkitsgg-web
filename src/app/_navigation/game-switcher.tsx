'use client';

import type { GameId } from '@prisma/client';
import { LucideChevronDown } from 'lucide-react';
import * as React from 'react';
import {
  Dropdown,
  DropdownButton,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/dropdown';
import { SidebarItem, SidebarLabel } from '@/components/sidebar';
import { allGameConfigs, noGameConfig } from '@/features/game/constants';
import { useActiveGameConfig } from '@/features/game/hooks/use-active-game-config';

type GameSwitcherProps = {
  gameId: GameId | undefined;
};

const GameSwitcher = ({ gameId }: GameSwitcherProps) => {
  const { activeGameConfig } = useActiveGameConfig({
    gameId,
  });

  return (
    <Dropdown>
      <DropdownButton as={SidebarItem}>
        <div className="flex aspect-square size-14 items-center justify-center rounded-lg">
          {activeGameConfig.logo}
        </div>
        <SidebarLabel>
          {activeGameConfig.path === noGameConfig.path
            ? activeGameConfig.name
            : activeGameConfig.label}
        </SidebarLabel>
        <LucideChevronDown />
      </DropdownButton>
      <DropdownMenu className="min-w-64" anchor="bottom start">
        {allGameConfigs
          .filter((gameConfig) => gameConfig.id !== noGameConfig.id)
          .filter((gameConfig) => gameConfig.id !== 'rem2')
          .map((gameConfig) => (
            <DropdownItem key={gameConfig.name} href={gameConfig.path}>
              <div className="text-primary-foreground mr-2 flex size-10 items-center justify-center">
                {gameConfig.logo}
              </div>
              <DropdownLabel>{gameConfig.name}</DropdownLabel>
            </DropdownItem>
          ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export { GameSwitcher };
