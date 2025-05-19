'use client';

import {
  AudioWaveform,
  BookOpen,
  Bot,
  GalleryVerticalEnd,
  LucideChevronRight,
  Settings2,
  SquareTerminal
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { GameSwitcher } from '@/app/_navigation/sidebar/game-switcher';
import { ThemeSwitcher } from '@/components/theme/theme-switcher';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
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
  SidebarRail as BaseSidebarRail
} from '@/components/ui/sidebar';

const data = {
  games: [
    {
      name: 'Battle Aces',
      logo: AudioWaveform,
      plan: 'Startup'
    },
    {
      name: 'Remnant 2',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise'
    }
  ],
  nav: [
    {
      title: 'Playground',
      url: '#',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'History',
          url: '#'
        },
        {
          title: 'Starred',
          url: '#'
        },
        {
          title: 'Settings',
          url: '#'
        }
      ]
    },
    {
      title: 'Models',
      url: '#',
      icon: Bot,
      items: [
        {
          title: 'Genesis',
          url: '#'
        },
        {
          title: 'Explorer',
          url: '#'
        },
        {
          title: 'Quantum',
          url: '#'
        }
      ]
    },
    {
      title: 'Documentation',
      url: '#',
      icon: BookOpen,
      items: [
        {
          title: 'Introduction',
          url: '#'
        },
        {
          title: 'Get Started',
          url: '#'
        },
        {
          title: 'Tutorials',
          url: '#'
        },
        {
          title: 'Changelog',
          url: '#'
        }
      ]
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '#'
        },
        {
          title: 'Team',
          url: '#'
        },
        {
          title: 'Billing',
          url: '#'
        },
        {
          title: 'Limits',
          url: '#'
        }
      ]
    }
  ]
};

interface SidebarProps extends React.ComponentProps<typeof BaseSidebar> {
  userMenu: React.ReactNode | null;
}

const Sidebar = ({ userMenu, ...props }: SidebarProps) => {
  return (
    <BaseSidebar collapsible="icon" {...props}>
      <BaseSidebarHeader>
        <GameSwitcher teams={data.games} />
      </BaseSidebarHeader>
      <BaseSidebarContent>
        <BaseSidebarGroup>
          <BaseSidebarGroupLabel>Platform</BaseSidebarGroupLabel>
          <BaseSidebarMenu>
            {data.nav.map(item => (
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
                      {item.items?.map(subItem => (
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
          <div className="w-full flex flex-1 items-center justify-end pr-2">
            <div className="w-8 h-8">
              <ThemeSwitcher />
            </div>
          </div>
          <Separator className="my-4" />
          {userMenu}
        </BaseSidebarGroup>
      </BaseSidebarFooter>
      <BaseSidebarRail />
    </BaseSidebar>
  );
};

export { Sidebar };
