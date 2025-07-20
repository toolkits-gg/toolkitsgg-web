import {
  LucideBookOpen,
  LucideBoxes,
  LucideHelpCircle,
  type LucideIcon,
  LucideSettings2,
} from 'lucide-react';
import { changeLogPath } from '@/paths';

type NavItem = {
  title: string;
  url: string;
};

export type NavLink = {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive: boolean;
  items?: NavItem[];
};

export const buildsNavLink: NavLink = {
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
};

export const itemsNavLink = ({
  itemLookupPath,
  itemCollectorPath,
  itemQuizPath,
}: {
  itemLookupPath?: string;
  itemCollectorPath?: string;
  itemQuizPath?: string;
}): NavLink => {
  const items: NavItem[] = [];
  if (itemLookupPath) {
    items.push({ title: 'Item Lookup', url: itemLookupPath });
  }
  if (itemCollectorPath) {
    items.push({ title: 'Item Collector', url: itemCollectorPath });
  }
  if (itemQuizPath) {
    items.push({ title: 'Item Quiz', url: itemQuizPath });
  }

  return {
    title: 'Items',
    url: '#',
    icon: LucideBoxes,
    isActive: true,
    items,
  };
};

export const resourcesNavLink = (
  resources: Array<{
    title: string;
    url: string;
  }>,
  resourcesPath: string
): NavLink => {
  return {
    title: 'Resources',
    url: resourcesPath,
    icon: LucideBookOpen,
    isActive: true,
    items: [
      ...resources,
      {
        title: 'Changelog',
        url: changeLogPath(),
      },
    ],
  };
};

export const helpNavLink: NavLink = {
  title: 'Help',
  url: '#',
  icon: LucideHelpCircle,
  isActive: true,
  items: [
    {
      title: 'Get Started',
      url: '#',
    },
  ],
};
