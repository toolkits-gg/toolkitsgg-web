import {
  LucideBookOpen,
  LucideBoxes,
  LucideChevronRight,
  LucideSettings2,
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { GameSwitcher } from '@/app/_navigation/game-switcher';
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

const data = {
  nav: [
    {
      title: 'Builds',
      url: '#',
      icon: LucideSettings2,
      isActive: true,
      items: [
        {
          title: 'Featured Builds',
          url: '#',
        },
        {
          title: 'Community Builds',
          url: '#',
        },
        {
          title: 'Beginner Builds',
          url: '#',
        },
      ],
    },
    {
      title: 'Items',
      url: '#',
      icon: LucideBoxes,
      items: [
        {
          title: 'Item Lookup',
          url: '#',
        },
        {
          title: 'Item Tracker',
          url: '#',
        },
        {
          title: 'Item Quiz',
          url: '#',
        },
      ],
    },
    {
      title: 'Resources',
      url: '#',
      icon: LucideBookOpen,
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
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof BaseSidebar> {
  gameId: GameId | undefined;
  userMenu: React.ReactNode | null;
}

const AppSidebar = ({ gameId, userMenu, ...props }: AppSidebarProps) => {
  return (
    <BaseSidebar collapsible="offcanvas" {...props}>
      <BaseSidebarHeader>
        <GameSwitcher gameId={gameId} />
      </BaseSidebarHeader>
      <BaseSidebarContent>
        <BaseSidebarGroup>
          <BaseSidebarGroupLabel>Toolkit</BaseSidebarGroupLabel>
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
          <div className="flex w-full flex-1 items-center justify-end">
            <ThemeModeToggle />
          </div>
          <Separator className="my-4" />
          {userMenu}
        </BaseSidebarGroup>
      </BaseSidebarFooter>
      <BaseSidebarRail />
    </BaseSidebar>
  );
};

export { AppSidebar };
