'use client';

import { Flex } from '@mantine/core';
import { Fragment } from 'react';
import { AppNavbar } from '@/components/navigation/AppNavbar';
import { PageLayout } from '@/components/PageLayout';
import { allGameConfigs } from '@/features/game/constants';
import type { GameConfig } from '@/features/game/types';
import { CompactItemCard } from '@/features/item/components/CompactItemCard';
import { WideItemCard } from '@/features/item/components/WideItemCard';
import type { COE33ItemType } from '@/games/coe33/items/types';
import { getImageUrl } from '@/utils/url';

const HomePage = () => {
  const gameConfig = allGameConfigs.find(
    (config): config is GameConfig<COE33ItemType> => config.id === 'coe33'
  );

  if (!gameConfig) {
    throw new Error('Game configuration not found for COE33!');
  }

  return (
    <PageLayout appNavbar={<AppNavbar gameConfig={gameConfig} />}>
      <Flex wrap="wrap" align="center" justify="center" gap="sm">
        {gameConfig.items
          ?.filter((item) => item.category === 'WEAPON')
          .map((item) => (
            <Fragment key={item.slug}>
              <CompactItemCard
                item={item}
                imageSrc={getImageUrl(item.imageUrl, 'coe33')}
              />
              <WideItemCard
                item={item}
                imageSrc={getImageUrl(item.imageUrl, 'coe33')}
              />
            </Fragment>
          ))}
      </Flex>
    </PageLayout>
  );
};

export { HomePage };
