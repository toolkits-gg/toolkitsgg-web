import { Box, Group, ScrollArea } from '@mantine/core';
import classes from './AppNavbar.module.css';
import { useAuth } from '@/features/auth/hooks/use-auth';
import type { GameId } from '@prisma/client';
import type { GameConfig } from '@/features/game/types';
import { buildNavLinks } from '@/components/navigation/utils/build-nav-links';
import { GameSwitcher } from '@/components/navigation/components/GameSwitcher';
import { UserMenu } from '@/components/navigation/components/UserMenu';
import { NavbarLinksGroup } from '@/components/navigation/components/NavbarLinksGroup';
import { GameActions } from '@/components/navigation/components/GameActions';
import { ThemeChanger } from '@/features/theme/components/ThemeChanger';

type AppNavbarProps = {
  gameConfig: GameConfig<unknown> | undefined;
};

const AppNavbar = ({ gameConfig }: AppNavbarProps) => {
  // TODO Get user favorite games
  const favoriteGameIds: string[] = [];

  const { user } = useAuth();

  const gameId = gameConfig?.id as GameId | undefined;

  const isGameFavorited = favoriteGameIds.some(
    (favoriteGameId) => favoriteGameId === gameId
  );

  const navLinks = buildNavLinks(gameConfig);

  return (
    <nav className={classes.navbar}>
      <div className={classes.header}>
        <Group justify="space-between" wrap="nowrap">
          <GameSwitcher gameId="none" />
          <GameActions gameId="none" />
        </Group>
      </div>

      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>
          {navLinks.map((navLink) => (
            <NavbarLinksGroup {...navLink} key={navLink.label} />
          ))}
        </div>
      </ScrollArea>

      <Box className={classes.themeActions} p={4}>
        <ThemeChanger />
      </Box>

      <Box className={classes.footer} p={4}>
        <UserMenu />
      </Box>
    </nav>
  );
};

export { AppNavbar };
