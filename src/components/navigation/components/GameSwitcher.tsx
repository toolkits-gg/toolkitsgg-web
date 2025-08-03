'use client';

import type { GameId } from '@prisma/client';
import { noGameConfig } from '@/features/game/constants';
import { useAppTheme } from '@/features/theme/hooks/use-app-theme';
import { usePathname } from 'next/navigation';
import { allThemeClassNames } from '@/features/theme/constants';
import { toGameConfig } from '@/features/game/utils/game-id';
import React from 'react';
import { Avatar, Flex, Group, UnstyledButton } from '@mantine/core';
import classes from './GameSwitcher.module.css';
import { IconChevronRight } from '@tabler/icons-react';

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

    const gameConfig = toGameConfig(validatedGameId.current);

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
    <UnstyledButton className={classes.game}>
      <Group>
        <div className={classes.logo}>{activeGameConfig.logo(48)}</div>

        <IconChevronRight size={14} stroke={1.5} />
        {/** TODO */}
      </Group>
    </UnstyledButton>
  );
};

export { GameSwitcher };
