'use client';

import { Box, Flex, Group, ScrollArea } from '@mantine/core';
import classes from './AppNavbar.module.css';
import { useAuth } from '@/features/auth/hooks/use-auth';
import type { GameConfig } from '@/features/game/types';
import { GameSwitcher } from '@/components/navigation/GameSwitcher';
import { UserMenu } from '@/components/navigation/UserMenu';
import { NavbarLinksGroup } from '@/components/navigation/NavbarLinksGroup';
import { GameActions } from '@/components/navigation/GameActions';
import { ThemeChanger } from '@/features/theme/components/ThemeChanger';
import { navUtils } from '@/components/navigation/utils';

type AppNavbarProps = {
  gameConfig: GameConfig<unknown>;
};

function AppNavbar({ gameConfig }: AppNavbarProps) {
  // TODO Get user favorite games
  const favoriteGameIds: string[] = [];

  const { user } = useAuth();

  const gameId = gameConfig.id;

  const isGameFavorited = favoriteGameIds.some(
    (favoriteGameId) => favoriteGameId === gameId
  );

  const navLinks = navUtils.buildNavLinks(gameConfig);

  return (
    <nav className={classes.navbar}>
      <Flex
        justify="start"
        align="center"
        dir="column"
        wrap="nowrap"
        className={classes.header}
        gap="sm"
      >
        <Box style={{ flexGrow: 1 }}>
          <GameSwitcher gameConfig={gameConfig} />
        </Box>
        {gameId !== 'none' && (
          <Box style={{ flexGrow: 0 }}>
            <GameActions gameId={gameId} />
          </Box>
        )}
      </Flex>

      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>
          {navLinks.map((navLink) => (
            <NavbarLinksGroup {...navLink} key={navLink.label} />
          ))}
        </div>
      </ScrollArea>

      <Flex
        className={classes.secondaryActions}
        justify="flex-end"
        align="center"
      >
        <ThemeChanger />
      </Flex>

      <Flex className={classes.footer} justify="flex-start" align="center">
        <UserMenu />
      </Flex>
    </nav>
  );
}

export { AppNavbar };
