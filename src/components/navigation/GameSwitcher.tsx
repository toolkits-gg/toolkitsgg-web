'use client';

import { allGameConfigs, noGameConfig } from '@/features/game/constants';
import React from 'react';
import { Flex, Menu, Text, UnstyledButton } from '@mantine/core';
import classes from './GameSwitcher.module.css';
import { IconChevronDown } from '@tabler/icons-react';
import Link from 'next/link';
import type { GameConfig } from '@/features/game/types';

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
              justify="flex-start"
              p={2}
              bdrs="lg"
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
