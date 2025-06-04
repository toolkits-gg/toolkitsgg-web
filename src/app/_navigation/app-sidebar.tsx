'use client';

import {
  BookOpen,
  Bot,
  LucideChevronRight,
  Settings2,
  SquareTerminal,
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import * as React from 'react';
import { GameSwitcher } from '@/app/_navigation/game-switcher';
import { Logo } from '@/components/logo';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar as BaseSidebar,
  SidebarContent as BaseSidebarContent,
  SidebarFooter as BaseSidebarFooter,
  SidebarGroup as BaseSidebarGroup,
  SidebarGroupLabel as BaseSidebarGroupLabel,
  SidebarHeader as BaseSidebarHeader,
  SidebarMenu as BaseSidebarMenu,
  SidebarMenuButton as BaseSidebarMenuButton,
  SidebarMenuItem as BaseSidebarMenuItem,
  SidebarMenuSub as BaseSidebarMenuSub,
  SidebarMenuSubButton as BaseSidebarMenuSubButton,
  SidebarMenuSubItem as BaseSidebarMenuSubItem,
  SidebarRail as BaseSidebarRail,
} from '@/components/ui/sidebar';
import type { GameId } from '@/features/game/types';
import { ThemeModeToggle } from '@/features/theme/theme-mode-toggle';
import { homePath } from '@/paths';

const data = {
  nav: [
    {
      title: 'Playground',
      url: '#',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'History',
          url: '#',
        },
        {
          title: 'Starred',
          url: '#',
        },
        {
          title: 'Settings',
          url: '#',
        },
      ],
    },
    {
      title: 'Models',
      url: '#',
      icon: Bot,
      items: [
        {
          title: 'Genesis',
          url: '#',
        },
        {
          title: 'Explorer',
          url: '#',
        },
        {
          title: 'Quantum',
          url: '#',
        },
      ],
    },
    {
      title: 'Documentation',
      url: '#',
      icon: BookOpen,
      items: [
        {
          title: 'Introduction',
          url: '#',
        },
        {
          title: 'Get Started',
          url: '#',
        },
        {
          title: 'Tutorials',
          url: '#',
        },
        {
          title: 'Changelog',
          url: '#',
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '#',
        },
        {
          title: 'Team',
          url: '#',
        },
        {
          title: 'Billing',
          url: '#',
        },
        {
          title: 'Limits',
          url: '#',
        },
      ],
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof BaseSidebar> {
  gameId: GameId | undefined;
  userMenu: React.ReactNode | null;
}

const AppSidebar = ({ gameId, userMenu, ...props }: AppSidebarProps) => {
  const { theme, setTheme } = useTheme();

  const isDarkMode = theme?.endsWith('-dark');

  return (
    <BaseSidebar collapsible="icon" {...props}>
      <BaseSidebarHeader>
        <GameSwitcher gameId={gameId} />
      </BaseSidebarHeader>
      <BaseSidebarContent>
        <BaseSidebarGroup>
          <BaseSidebarGroupLabel>Platform</BaseSidebarGroupLabel>
          <BaseSidebarMenu>
            {data.nav.map((item) => (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <BaseSidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <BaseSidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <LucideChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </BaseSidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <BaseSidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <BaseSidebarMenuSubItem key={subItem.title}>
                          <BaseSidebarMenuSubButton asChild>
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </BaseSidebarMenuSubButton>
                        </BaseSidebarMenuSubItem>
                      ))}
                    </BaseSidebarMenuSub>
                  </CollapsibleContent>
                </BaseSidebarMenuItem>
              </Collapsible>
            ))}
          </BaseSidebarMenu>
        </BaseSidebarGroup>
      </BaseSidebarContent>
      <BaseSidebarFooter>
        <BaseSidebarGroup>
          <div className="flex w-full flex-1 items-center justify-between pr-2">
            <Link
              href={homePath()}
              onClick={() => setTheme(isDarkMode ? 'default-dark' : 'default')}
            >
              <div className="flex h-[56px] w-[56px] items-center justify-center">
                <Logo gameId={gameId || 'none'} size={64} />
              </div>
            </Link>

            <ThemeModeToggle />
          </div>
          <Separator className="my-1" />
          {userMenu}
        </BaseSidebarGroup>
      </BaseSidebarFooter>
      <BaseSidebarRail />
    </BaseSidebar>
  );
};

export { AppSidebar };
