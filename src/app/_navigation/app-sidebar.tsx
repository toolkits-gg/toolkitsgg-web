import type { GameId } from '@prisma/client';
import { LucideInbox, LucideSearch } from 'lucide-react';
import { Fragment } from 'react';
import { FavoriteGameButton } from '@/app/_navigation/favorite-game-button';
import { GameSwitcher } from '@/app/_navigation/game-switcher';
import {
  buildsNavLink,
  helpNavLink,
  itemsNavLink,
  type NavLink,
  resourcesNavLink,
} from '@/app/_navigation/nav-links';
import { UserMenu } from '@/app/_navigation/user-menu';
import { Divider } from '@/components/divider';
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
} from '@/components/sidebar';
import { getAuth } from '@/features/auth/queries/get-auth';
import { getFavoriteGameIds } from '@/features/game/actions/get-favorite-game-ids';
import { allGameConfigs } from '@/features/game/constants';
import { ThemeSwitcher } from '@/features/theme/components/theme-switcher';

type SidebarProps = {
  gameId: GameId | undefined;
};

const AppSidebar = async ({ gameId }: SidebarProps) => {
  const [authResult, favoriteGameIds] = await Promise.all([
    getAuth(),
    getFavoriteGameIds(),
  ]);

  const user = authResult.user;

  const isGameFavorited = favoriteGameIds.some(
    (favoriteGameId) => favoriteGameId === gameId
  );

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
    <Sidebar>
      <SidebarHeader>
        <GameSwitcher gameId={gameId} />
        {gameId && (
          <div className="mb-4 flex flex-1 flex-col gap-2">
            <div className="flex flex-1 items-center justify-start gap-2">
              <FavoriteGameButton
                gameId={gameId}
                isFavorite={isGameFavorited}
              />
            </div>
            <Divider />
          </div>
        )}
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
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-1 items-center justify-end gap-2">
            <ThemeSwitcher />
          </div>
          <UserMenu user={user ?? undefined} />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export { AppSidebar };
