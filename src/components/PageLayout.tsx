'use client';

import { DefaultLogo } from '@/components/Logo';
import { AppNavbar } from '@/components/navigation/components/AppNavbar';
import { AppShell, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type React from 'react';

type PageLayoutProps = React.PropsWithChildren<{
  navbar?: React.ReactNode;
  sidebar?: React.ReactNode;
}>;

const PageLayout = ({ children }: PageLayoutProps) => {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <DefaultLogo size={64} />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        <AppNavbar />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>

      <AppShell.Footer>
        © {new Date().getFullYear()} Toolkits.gg
      </AppShell.Footer>
    </AppShell>
  );
};

export { PageLayout };
