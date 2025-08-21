'use client';

import { Anchor, AppShell, Burger, Flex, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { GameId } from '@prisma/client';
import Link from 'next/link';
import type React from 'react';
import { DefaultLogo } from '@/components/Logo';
import { AppNavbar } from '@/components/navigation/AppNavbar';
import { allGameConfigs, noGameConfig } from '@/features/game/constants';
import { homePath } from '@/paths';
import classes from './PageLayout.module.css';

type PageLayoutProps = React.PropsWithChildren<{
  gameId: GameId | undefined;
}>;

const PageLayout = ({ children, gameId }: PageLayoutProps) => {
  const [opened, { toggle }] = useDisclosure();

  const gameConfig = allGameConfigs.find((config) => config.id === gameId);

  return (
    <AppShell
      padding="md"
      layout="alt"
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
    >
      <AppShell.Header className={classes.header}>
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

      <AppShell.Navbar h="100%">
        <AppNavbar gameConfig={gameConfig || noGameConfig} />
      </AppShell.Navbar>

      <AppShell.Main className={classes.main}>{children}</AppShell.Main>

      <AppShell.Footer className={classes.footer} p={4}>
        © {new Date().getFullYear()} Toolkits.gg
      </AppShell.Footer>
    </AppShell>
  );
};

export { PageLayout };
