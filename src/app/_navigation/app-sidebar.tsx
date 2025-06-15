import type { GameId } from '@prisma/client';
import { LucideChevronRight } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { GameActions } from '@/app/_navigation/game-actions';
import { GameSwitcher } from '@/app/_navigation/game-switcher';
import {
  buildsNavLink,
  helpNavLink,
  itemsNavLink,
  type NavLink,
  resourcesNavLink,
} from '@/app/_navigation/nav-links';
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
import { getAuth } from '@/features/auth/queries/get-auth';
import { allGameConfigs } from '@/features/game/constants';
import { ThemeModeToggle } from '@/features/theme/components/theme-mode-toggle';
import { ThemeSwitcher } from '@/features/theme/components/theme-switcher';

interface AppSidebarProps extends React.ComponentProps<typeof BaseSidebar> {
  gameId: GameId | undefined;
  userMenu: React.ReactNode | null;
}

const AppSidebar = async ({ gameId, userMenu, ...props }: AppSidebarProps) => {
  const { user } = await getAuth();
  const gameConfig = allGameConfigs.find((config) => config.id === gameId);

  let navLinks: NavLink[] = [helpNavLink];

  if (gameConfig) {
    navLinks = [];
    if (gameConfig.items && gameConfig.items.length > 0) {
      navLinks.push(
        itemsNavLink({
          itemLookupPath: gameConfig.itemLookupPath,
          itemTrackerPath: gameConfig.itemTrackerPath,
          itemQuizPath: gameConfig.itemQuizPath,
        })
      );
    }
    if (!!gameConfig.buildsEnabled) {
      navLinks.push(buildsNavLink);
    }
    if (gameConfig.resourcesPath) {
      navLinks.push(
        resourcesNavLink(gameConfig.resources, gameConfig.resourcesPath)
      );
    }

    navLinks.push(helpNavLink);
  }

  return (
    <BaseSidebar collapsible="offcanvas" {...props}>
      <BaseSidebarHeader>
        <GameSwitcher gameId={gameId} />
      </BaseSidebarHeader>
      <BaseSidebarContent>
        <BaseSidebarGroup>
          <BaseSidebarGroupLabel>Toolkit</BaseSidebarGroupLabel>
          {gameId && user && <GameActions gameId={gameId} />}
          <BaseSidebarMenu>
            {navLinks.map((item) => (
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
          <div className="flex w-full flex-1 items-center justify-end gap-2">
            <ThemeSwitcher />
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
