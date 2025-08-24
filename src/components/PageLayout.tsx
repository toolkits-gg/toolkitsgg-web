'use client';

import {
  Anchor,
  AppShell,
  Box,
  Burger,
  Flex,
  Group,
  ScrollArea,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { GameId } from '@prisma/client';
import Link from 'next/link';
import type React from 'react';
import { DefaultLogo } from '@/components/Logo';
import { GameActions } from '@/components/navigation/GameActions';
import { GameSwitcher } from '@/components/navigation/GameSwitcher';
import { NavbarLinksGroup } from '@/components/navigation/NavbarLinksGroup';
import { navUtils } from '@/components/navigation/utils';
import { UserMenu } from '@/components/UserMenu';
import { allGameConfigs, noGameConfig } from '@/features/game/constants';
import { ThemeChanger } from '@/features/theme/components/ThemeChanger';
import { homePath } from '@/paths';
import classes from './PageLayout.module.css';

type PageLayoutProps = React.PropsWithChildren<{
  gameId: GameId | undefined;
}>;

const PageLayout = ({ children, gameId }: PageLayoutProps) => {
  const [opened, { toggle }] = useDisclosure();

  const gameConfig =
    allGameConfigs.find((config) => config.id === gameId) ?? noGameConfig;

  const navLinks = navUtils.buildNavLinks(gameConfig);

  return (
    <AppShell
      padding="md"
      layout="alt"
      header={{ height: 60 }}
      withBorder={false}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
    >
      <AppShell.Header className={classes.header} px="sm">
        <Group h="100%">
          <Flex justify="start" align="center">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
          </Flex>
          <Flex className={classes.logoContainer}>
            <Anchor href={homePath()} component={Link}>
              <DefaultLogo size={64} />
            </Anchor>
          </Flex>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar h="100%" className={classes.appshellNavbar}>
        <nav className={classes.navbar}>
          <Flex
            justify="space-between"
            align="center"
            dir="column"
            wrap="nowrap"
            className={classes.navbarHeader}
            gap="sm"
          >
            <Burger
              opened={opened}
              onClick={toggle}
              size="sm"
              hiddenFrom="sm"
            />
            <Box style={{ flexGrow: 1 }}>
              <GameSwitcher gameConfig={gameConfig} />
            </Box>
            {gameId && (
              <Box style={{ flexGrow: 0 }}>
                <GameActions gameId={gameId} />
              </Box>
            )}
          </Flex>

          <ScrollArea className={classes.navbarLinks}>
            <div className={classes.navbarLinksInner}>
              {navLinks.map((navLink) => (
                <NavbarLinksGroup {...navLink} key={navLink.label} />
              ))}
            </div>
          </ScrollArea>

          <Flex
            className={classes.navbarSecondaryActions}
            justify="flex-end"
            align="center"
          >
            <ThemeChanger />
          </Flex>

          <Flex
            className={classes.navbarFooter}
            justify="flex-start"
            align="center"
          >
            <UserMenu />
          </Flex>
        </nav>
      </AppShell.Navbar>

      <AppShell.Main className={classes.main}>{children}</AppShell.Main>

      <AppShell.Footer className={classes.footer}>
        <Text size="xs" c="dimmed">
          © {new Date().getFullYear()} Toolkits.gg
        </Text>
      </AppShell.Footer>
    </AppShell>
  );
};

export { PageLayout };
