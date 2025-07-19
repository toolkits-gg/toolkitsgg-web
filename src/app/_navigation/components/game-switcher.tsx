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
import { useAppTheme } from '@/features/theme/hooks/use-theme';
import { usePathname } from 'next/navigation';
import { allThemeClassNames } from '@/features/theme/constants';

type UseActiveGameConfigArgs = {
  gameId: GameId | undefined;
};

const useActiveGameConfig = ({ gameId }: UseActiveGameConfigArgs) => {
  const { colorTheme } = useAppTheme();
  const pathname = usePathname();
  const validatedGameId = React.useRef<GameId | undefined>(gameId);

  const activeGameConfig = React.useMemo(() => {
    if (!gameId && pathname !== '/') {
      validatedGameId.current =
        (allThemeClassNames.find(
          (className) => colorTheme === className
        ) as GameId) || noGameConfig.id;
    }

    const gameConfig = allGameConfigs.find(
      (config) => config.id === validatedGameId.current
    );

    if (!gameConfig) {
      return noGameConfig;
    }

    return gameConfig;
  }, [pathname, gameId, colorTheme]);

  return {
    activeGameConfig,
    validatedGameId,
  };
};

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
