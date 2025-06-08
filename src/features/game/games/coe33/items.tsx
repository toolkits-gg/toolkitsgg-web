import type { COE33ItemCategory, COE33ItemTag } from '@prisma/client';

export type COE33ItemType = {
  name: string;
  description: string;
  slug: string;
  imageUrl: string;
  category: COE33ItemCategory;
  tags: COE33ItemTag[];
};

const coe33Items: COE33ItemType[] = [
  {
    name: 'Accelerating Heal',
    description: 'Healing an ally also applies rush for 1 turn.',
    slug: 'acch',
    category: 'PICTO',
    tags: ['HEALTH', 'SPEED'],
    imageUrl: '',
  },
  {
    name: 'Accelerating Last Stand',
    description: 'Gain Rush if fighting alone.',
    slug: 'acls',
    category: 'PICTO',
    tags: ['HEALTH', 'SPEED'],
    imageUrl: '',
  },
];

export { coe33Items };
