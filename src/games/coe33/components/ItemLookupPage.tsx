import { Flex } from '@mantine/core';
import { PageLayout } from '@/components/PageLayout';
import { allGameConfigs } from '@/features/game/constants';
import type { GameConfig } from '@/features/game/types';
import { WideItemCard } from '@/features/item/components/WideItemCard';
import type { COE33ItemType } from '@/games/coe33/items/types';
import { getImageUrl } from '@/utils/url';

const ItemLookupPage = () => {
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
            <WideItemCard
              key={item.slug}
              item={item}
              imageSrc={getImageUrl(item.imageUrl, 'coe33')}
            />
          ))}
      </Flex>
    </PageLayout>
  );
};

export { ItemLookupPage };
