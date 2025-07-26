import { coe33Items } from '@/games/coe33/items/all-items';
import type { COE33ItemType } from '@/games/coe33/items/types';

export const generateSlugs = (skillItems: COE33ItemType[]): COE33ItemType[] => {
  const results = skillItems.map((item) => {
    const existingItem = coe33Items.find(
      (existing) => existing.internalSlug === item.internalSlug
    );

    return {
      ...item,
      slug: existingItem ? existingItem.slug : generateSlug(skillItems),
    };
  });

  return results;
};

const generateSlug = (skillItems: COE33ItemType[]): string => {
  // slug should be a unique randomized 4-letter string
  let slug = Math.random().toString(36).substring(2, 6);
  let slugExists =
    coe33Items.some((item) => item.slug === slug) ||
    skillItems.some((item) => item.slug === slug);
  while (slugExists) {
    slug = Math.random().toString(36).substring(2, 6);
    slugExists =
      coe33Items.some((item) => item.slug === slug) ||
      skillItems.some((item) => item.slug === slug);
  }
  return slug;
};
