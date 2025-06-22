import type { GameId } from '@prisma/client';
import {
  LucideChevronUp,
  LucideCog,
  LucideInbox,
  LucideLightbulb,
  LucideLogOut,
  LucideSearch,
  LucideShieldCheck,
  LucideUser,
} from 'lucide-react';
import { Fragment } from 'react';
import { GameSwitcher } from '@/app/_navigation/game-switcher';
import {
  buildsNavLink,
  helpNavLink,
  itemsNavLink,
  type NavLink,
  resourcesNavLink,
} from '@/app/_navigation/nav-links';
import { Avatar } from '@/components/avatar';
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/dropdown';
import {
  Sidebar as CatalystSidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
} from '@/components/sidebar';
import { getAuth } from '@/features/auth/queries/get-auth';
import { allGameConfigs } from '@/features/game/constants';

type SidebarProps = {
  gameId: GameId | undefined;
};

const Sidebar = async ({ gameId }: SidebarProps) => {
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
    <CatalystSidebar>
      <SidebarHeader>
        <GameSwitcher gameId={undefined} />
        {gameConfig && user && (
          <SidebarSection>
            <SidebarItem href="/search">
              <LucideSearch />
              <SidebarLabel>Search</SidebarLabel>
            </SidebarItem>
            <SidebarItem href="/inbox">
              <LucideInbox />
              <SidebarLabel>Inbox</SidebarLabel>
            </SidebarItem>
          </SidebarSection>
        )}
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          {navLinks.map((navLink) => (
            <Fragment key={navLink.title}>
              <SidebarItem href={navLink.url}>
                <navLink.icon />
                <SidebarLabel>{navLink.title}</SidebarLabel>
              </SidebarItem>
              {navLink.items && navLink.items.length > 0 && (
                <div className="dark:border-primary-700 ml-2 border-l border-zinc-200 pl-2">
                  {navLink.items?.map((item) => (
                    <SidebarItem key={item.title} href={item.url}>
                      <SidebarLabel>{item.title}</SidebarLabel>
                    </SidebarItem>
                  ))}
                </div>
              )}
            </Fragment>
          ))}
        </SidebarSection>
      </SidebarBody>
      <SidebarFooter>
        <Dropdown>
          <DropdownButton as={SidebarItem}>
            <span className="flex min-w-0 items-center gap-3">
              <Avatar
                src="/profile-photo.jpg"
                className="size-10"
                square
                alt=""
              />
              <span className="min-w-0">
                <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                  Erica
                </span>
                <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                  erica@example.com
                </span>
              </span>
            </span>

            <LucideChevronUp />
          </DropdownButton>
          <DropdownMenu className="min-w-64" anchor="top start">
            <DropdownItem href="/my-profile">
              <LucideUser />
              <DropdownLabel>My profile</DropdownLabel>
            </DropdownItem>
            <DropdownItem href="/settings">
              <LucideCog />
              <DropdownLabel>Settings</DropdownLabel>
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem href="/privacy-policy">
              <LucideShieldCheck />
              <DropdownLabel>Privacy policy</DropdownLabel>
            </DropdownItem>
            <DropdownItem href="/share-feedback">
              <LucideLightbulb />
              <DropdownLabel>Share feedback</DropdownLabel>
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem href="/logout">
              <LucideLogOut />
              <DropdownLabel>Sign out</DropdownLabel>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </SidebarFooter>
    </CatalystSidebar>
  );
};

export { Sidebar };
