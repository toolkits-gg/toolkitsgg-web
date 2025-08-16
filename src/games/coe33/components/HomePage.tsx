'use client';

import { AppNavbar } from '@/components/navigation/AppNavbar';
import { PageLayout } from '@/components/PageLayout';
import { allGameConfigs } from '@/features/game/constants';
import type { GameConfig } from '@/features/game/types';
import { ItemCard } from '@/features/item/components/ItemCard';
import type { COE33ItemType } from '@/games/coe33/items/types';
import { getImageUrl } from '@/utils/url';
import { Flex } from '@mantine/core';

const HomePage = () => {
  const gameConfig = allGameConfigs.find(
    (config): config is GameConfig<COE33ItemType> => config.id === 'coe33'
  );

  if (!gameConfig) {
    throw new Error('Game configuration not found for COE33!');
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
};

export { HomePage };
