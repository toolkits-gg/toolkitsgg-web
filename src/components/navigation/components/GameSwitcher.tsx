'use client';

import type { GameId } from '@prisma/client';
import { allGameConfigs, noGameConfig } from '@/features/game/constants';
import { useAppTheme } from '@/features/theme/hooks/use-app-theme';
import { usePathname } from 'next/navigation';
import { toGameConfig } from '@/features/game/utils/game-id';
import React from 'react';
import {
  Anchor,
  Box,
  Flex,
  Group,
  Menu,
  Text,
  UnstyledButton,
} from '@mantine/core';
import classes from './GameSwitcher.module.css';
import { IconChevronRight } from '@tabler/icons-react';
import { allThemeClassNames } from '@/features/theme/constants';
import Link from 'next/link';

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
  }, [pathname, gameId]);

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
    <Menu
      width={300}
      position="bottom-start"
      transitionProps={{ transition: 'fade-down', duration: 150 }}
    >
      <Menu.Target>
        <Flex align="center" justify="center" gap="sm">
          <Box className={classes.logo} p={5}>
            {activeGameConfig.logo(48)}
          </Box>
          <IconChevronRight size={14} stroke={1.5} />
        </Flex>
      </Menu.Target>
      <Menu.Dropdown className={classes.menu}>
        {allGameConfigs
          .filter((gameConfig) => gameConfig.id !== noGameConfig.id)
          .map((gameConfig) => (
            <Menu.Item key={gameConfig.id} className={classes.menuItem}>
              <Anchor
                href={gameConfig.path}
                component={Link}
                className={classes.link}
              >
                <Flex align="center" justify="center" gap="sm">
                  {gameConfig.logo(48)}
                  <Text size="sm">{gameConfig.name}</Text>
                </Flex>
              </Anchor>
            </Menu.Item>
          ))}
      </Menu.Dropdown>
    </Menu>
  );
};

export { GameSwitcher };
