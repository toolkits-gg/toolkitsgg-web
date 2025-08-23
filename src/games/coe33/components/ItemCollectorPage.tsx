'use client';

import { Flex } from '@mantine/core';
import { motion } from 'framer-motion';
import { PageLayout } from '@/components/PageLayout';
import { allGameConfigs } from '@/features/game/constants';
import type { GameConfig } from '@/features/game/types';
import { CompactItemCard } from '@/features/item/components/CompactItemCard';
import type { COE33ItemType } from '@/games/coe33/items/types';
import { getImageUrl } from '@/utils/url';

const ItemCollectorPage = () => {
  const gameConfig = allGameConfigs.find(
    (config): config is GameConfig<COE33ItemType> => config.id === 'coe33'
  );

  if (!gameConfig) {
    throw new Error('Game configuration not found for COE33!');
  }

  return (
    <PageLayout gameId="coe33">
      <Flex wrap="wrap" align="center" justify="center" gap="sm">
        {gameConfig.items
          ?.filter((item) => item.category === 'WEAPON')
          .map((item) => (
            <motion.div
              key={item.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CompactItemCard
                item={item}
                imageSrc={getImageUrl(item.imageUrl, 'coe33')}
              />
            </motion.div>
          ))}
      </Flex>
    </PageLayout>
  );
};

export { ItemCollectorPage };
