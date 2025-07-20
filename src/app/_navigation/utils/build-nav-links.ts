import {
  buildsNavLink,
  helpNavLink,
  itemsNavLink,
  resourcesNavLink,
  type NavLink,
} from '@/app/_navigation/components/nav-links';
import type { GameConfig } from '@/features/game/types';

export const buildNavLinks = (gameConfig: GameConfig<unknown> | undefined) => {
  if (!gameConfig) {
    const noGameConfigLinks = [helpNavLink];
    return noGameConfigLinks;
  }

  const navLinks = [];
  if (gameConfig.items && gameConfig.items.length > 0) {
    navLinks.push(
      itemsNavLink({
        itemLookupPath: gameConfig.itemLookupPath,
        itemCollectorPath: gameConfig.itemCollectorPath,
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

  return navLinks;
};
