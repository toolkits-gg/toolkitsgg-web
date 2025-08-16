'use client';

import { AppNavbar } from '@/components/navigation/components/AppNavbar';
import { PageLayout } from '@/components/PageLayout';
import { allGameConfigs } from '@/features/game/constants';
import type { GameConfig } from '@/features/game/types';
import type { COE33ItemType } from '@/games/coe33/items/types';
import { Flex } from '@mantine/core';

const ItemCollectorPage = () => {
  const gameConfig = allGameConfigs.find(
    (config): config is GameConfig<COE33ItemType> => config.id === 'coe33'
  );

  if (!gameConfig) {
    throw new Error('Game configuration not found for COE33!');
  }

  return (
    <PageLayout appNavbar={<AppNavbar gameConfig={gameConfig} />}>
      <Flex wrap="wrap" align="center" justify="space-between" gap="sm">
        Item Collector Page
      </Flex>
    </PageLayout>
  );
};

export { ItemCollectorPage };
