import type { NavLink, NavLinkLinks } from '@/components/navigation/types';
import type { GameConfig } from '@/features/game/types';
import { changeLogPath } from '@/paths';

const helpNavLink: NavLink = {
  label: 'Help',
  icon: undefined, // TODO
  initiallyOpened: true,
  links: [
    {
      label: 'Get Started',
      link: '#',
    },
  ],
};

export const buildNavLinks = (
  gameConfig: GameConfig<unknown> | undefined
): NavLink[] => {
  if (!gameConfig) {
    const noGameConfigLinks = [helpNavLink];
    return noGameConfigLinks;
  }

  const navLinks: NavLink[] = [];

  // * --- Navigation for Item related pages --- * //
  if (gameConfig.items && gameConfig.items.length > 0) {
    const links: NavLinkLinks = [];

    if (gameConfig.pages?.itemLookup) {
      links.push({
        label: 'Item Lookup',
        link: gameConfig.pages.itemLookup.path,
      });
    }
    if (gameConfig.pages?.itemCollector) {
      links.push({
        label: 'Item Collector',
        link: gameConfig.pages.itemCollector.path,
      });
    }
    if (gameConfig.pages?.itemQuiz) {
      links.push({ label: 'Item Quiz', link: gameConfig.pages.itemQuiz.path });
    }

    if (links) {
      navLinks.push({
        label: 'Items',
        url: undefined,
        icon: undefined, // TODO
        initiallyOpened: true,
        links,
      });
    }
  }

  // * --- Navigation for Builds related pages --- * //
  if (!!gameConfig.buildsEnabled) {
    navLinks.push({
      label: 'Builds',
      icon: undefined, // TODO
      initiallyOpened: true,
      links: [
        {
          label: 'Featured Builds',
          link: '#',
        },
        {
          label: 'Community Builds',
          link: '#',
        },
        {
          label: 'Beginner Builds',
          link: '#',
        },
      ],
    });
  }

  // * --- Navigation for Resources related pages --- * //
  if (gameConfig.resourcesPath) {
    navLinks.push({
      label: 'Resources',
      icon: undefined, // TODO
      initiallyOpened: true,
      links: [
        ...gameConfig.resources,
        {
          label: 'Changelog',
          link: changeLogPath(),
        },
      ],
    });
  }

  // * --- Navigation for Help related pages --- * //
  navLinks.push(helpNavLink);

  return navLinks;
};
