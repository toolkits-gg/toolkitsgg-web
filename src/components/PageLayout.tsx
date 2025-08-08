'use client';

import { DefaultLogo } from '@/components/Logo';
import { AppNavbar } from '@/components/navigation/components/AppNavbar';
import { AppShell, Burger, Flex, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type React from 'react';
import classes from './PageLayout.module.css';

type PageLayoutProps = React.PropsWithChildren<{
  navbar?: React.ReactNode;
  sidebar?: React.ReactNode;
}>;

const PageLayout = ({ children }: PageLayoutProps) => {
  const [opened, { toggle }] = useDisclosure();

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
            <DefaultLogo size={64} />
          </Flex>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar h="100%">
        <AppNavbar gameConfig={undefined} />
      </AppShell.Navbar>

      <AppShell.Main className={classes.main}>{children}</AppShell.Main>

      <AppShell.Footer className={classes.footer} p={4}>
        © {new Date().getFullYear()} Toolkits.gg
      </AppShell.Footer>
    </AppShell>
  );
};

export { PageLayout };
