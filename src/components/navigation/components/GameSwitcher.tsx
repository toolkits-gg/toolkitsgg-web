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
  Button,
  Flex,
  Group,
  Menu,
  Text,
  UnstyledButton,
} from '@mantine/core';
import classes from './GameSwitcher.module.css';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
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
        <UnstyledButton w="100%" bg="sidebarBg">
          <Flex
            className={classes.logoContainer}
            align="center"
            justify="space-between"
            gap="md"
            bdrs="lg"
            p={2}
          >
            <Flex
              className={classes.logo}
              align="center"
              justify="center"
              p={2}
              bdrs="lg"
            >
              {activeGameConfig.logo(48)}
            </Flex>
            <IconChevronDown size={14} stroke={1.5} />
          </Flex>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown className={classes.menu}>
        {allGameConfigs
          .filter((gameConfig) => gameConfig.id !== noGameConfig.id)
          .map((gameConfig) => (
            <Menu.Item key={gameConfig.id} className={classes.menuItem}>
              <UnstyledButton
                href={gameConfig.path}
                component={Link}
                variant="subtle"
              >
                <Flex align="center" justify="start" gap="sm">
                  {gameConfig.logo(48)}
                  <Text size="sm" fw={700}>
                    {gameConfig.name}
                  </Text>
                </Flex>
              </UnstyledButton>
            </Menu.Item>
          ))}
      </Menu.Dropdown>
    </Menu>
  );
};

export { GameSwitcher };
