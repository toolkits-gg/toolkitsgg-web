import type { GameId } from '@prisma/client';
import { Fragment } from 'react';
import { FavoriteGameButton } from '@/app/_navigation/components/favorite-game-button';
import { GameSwitcher } from '@/app/_navigation/components/game-switcher';
import { UserMenu } from '@/app/_navigation/components/user-menu';
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
import { ThemeSwitcher } from '@/features/theme/components/theme-switcher';
import { buildNavLinks } from '@/app/_navigation/utils/build-nav-links';
import type { GameConfig } from '@/features/game/types';

type AppSidebarProps = {
  gameConfig: GameConfig<unknown> | undefined;
};

const AppSidebar = async ({ gameConfig }: AppSidebarProps) => {
  const [authResult, favoriteGameIds] = await Promise.all([
    getAuth(),
    getFavoriteGameIds(),
  ]);

  const user = authResult.user;

  const gameId = gameConfig?.id as GameId | undefined;

  const isGameFavorited = favoriteGameIds.some(
    (favoriteGameId) => favoriteGameId === gameId
  );

  const navLinks = buildNavLinks(gameConfig);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex flex-col gap-1">
          <GameSwitcher gameId={gameId} />
          {gameId && gameConfig && user && (
            <div className="flex flex-1 items-center justify-between gap-x-2">
              <FavoriteGameButton
                gameId={gameId}
                isFavorite={isGameFavorited}
              />
            </div>
          )}
        </div>
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
