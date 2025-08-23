'use client';

import { Flex, Group, Menu, Text, UnstyledButton } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import Link from 'next/link';
import React from 'react';
import { allGameConfigs, noGameConfig } from '@/features/game/constants';
import type { GameConfig } from '@/features/game/types';
import classes from './GameSwitcher.module.css';

type GameSwitcherProps = {
  gameConfig: GameConfig<unknown>;
};

const GameSwitcher = ({ gameConfig }: GameSwitcherProps) => {
  return (
    <Menu
      width={300}
      position="bottom-start"
      transitionProps={{ transition: 'fade-down', duration: 150 }}
    >
      <Menu.Target>
        <UnstyledButton className={classes.game}>
          <Group wrap="nowrap">
            <Flex
              className={classes.logo}
              align="center"
              justify="flex-start"
              p={2}
              w="100%"
              gap="md"
            >
              {gameConfig?.logo(48)}
              <Text size="sm" fw="bolder">
                {gameConfig?.label === 'Default'
                  ? 'Select a game'
                  : gameConfig?.label}
              </Text>
            </Flex>
            <IconChevronDown size={14} stroke={1.5} />
          </Group>
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
