'use client';

import { Flex, Group, ScrollArea } from '@mantine/core';
import classes from './AppNavbar.module.css';
import { useAuth } from '@/features/auth/hooks/use-auth';
import type { GameId } from '@prisma/client';
import type { GameConfig } from '@/features/game/types';
import { buildNavLinks } from '@/components/navigation/build-nav-links';
import { GameSwitcher } from '@/components/navigation/GameSwitcher';
import { UserMenu } from '@/components/navigation/UserMenu';
import { NavbarLinksGroup } from '@/components/navigation/NavbarLinksGroup';
import { GameActions } from '@/components/navigation/GameActions';
import { ThemeChanger } from '@/features/theme/components/ThemeChanger';

type AppNavbarProps = {
  gameConfig: GameConfig<unknown>;
};

function AppNavbar({ gameConfig }: AppNavbarProps) {
  // TODO Get user favorite games
  const favoriteGameIds: string[] = [];

  const { user } = useAuth();

  const gameId = gameConfig?.id;

  const isGameFavorited = favoriteGameIds.some(
    (favoriteGameId) => favoriteGameId === gameId
  );

  const navLinks = buildNavLinks(gameConfig);

  return (
    <nav className={classes.navbar}>
      <div className={classes.header}>
        <Group justify="space-between" wrap="nowrap">
          <GameSwitcher gameConfig={gameConfig} />
          <GameActions gameId={gameId} />
        </Group>
      </div>

      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>
          {navLinks.map((navLink) => (
            <NavbarLinksGroup {...navLink} key={navLink.label} />
          ))}
        </div>
      </ScrollArea>

      <Flex align="center" justify="end" p={4}>
        <ThemeChanger />
      </Flex>

      <Flex className={classes.footer} p={4}>
        <UserMenu />
      </Flex>
    </nav>
  );
}

export { AppNavbar };
