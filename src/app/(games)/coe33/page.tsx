'use client';

import { ItemCard } from '@/features/item/components/ItemCard';
import { getImageUrl } from '@/utils/url';
import { toGameConfig } from '@/features/game/utils/game-id';
import type { COE33ItemType } from '@/games/coe33/items/types';
import { PageLayout } from '@/components/PageLayout';
import { Flex } from '@mantine/core';
import { AppNavbar } from '@/components/navigation/components/AppNavbar';

export default function GamePage() {
  const gameConfig = toGameConfig<COE33ItemType>('coe33');

  if (!gameConfig) {
    throw new Error('Game configuration not found');
  }

  return (
    <PageLayout appNavbar={<AppNavbar gameConfig={gameConfig} />}>
      <Flex wrap="wrap" align="center" justify="space-between" gap="sm">
        {gameConfig.items
          ?.filter((item) => item.category === 'WEAPON')
          .map((item) => (
            <ItemCard
              key={item.slug}
              item={item}
              imageSrc={getImageUrl(item.imageUrl, 'coe33')}
            />
          ))}
      </Flex>
    </PageLayout>
  );
}
