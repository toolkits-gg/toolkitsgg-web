import { LucideSailboat } from 'lucide-react';
import Image from 'next/image';
import { PageLayout } from '@/app/_navigation/page-layout';
import { Button } from '@/components/ui/button';
import { allGameConfigs } from '@/features/game/constants';
import type { COE33ItemType } from '@/features/game/games/coe33/items';
import type { GameConfig } from '@/features/game/types';
import { ItemCard } from '@/features/item/components/item-card';
import { getImageUrl } from '@/utils/url';

export default async function GamePage() {
  const gameConfig = allGameConfigs.find((config) => config.id === 'coe33') as
    | GameConfig<COE33ItemType>
    | undefined;

  if (!gameConfig) {
    throw new Error('Game configuration not found');
  }

  return (
    <PageLayout
      gameId={gameConfig?.id}
      heroImage={
        <Image
          src={getImageUrl(
            `backgrounds/T_UI_Level_Lumiere.webp`,
            gameConfig.id
          )}
          alt="Background of Lumiere from Clair Obscur: Expedition 33"
          width={1500}
          height={810}
        />
      }
    >
      <div className="col-span-full flex w-full flex-wrap items-center justify-between gap-2">
        {gameConfig?.items
          ?.filter((item) => item.category === 'SKILL')
          .map((item) => (
            <ItemCard
              key={item.slug}
              item={item}
              gameId={gameConfig.id}
              actions={
                <Button size="icon" variant="ghost">
                  <LucideSailboat className="h-4 w-4" />
                </Button>
              }
            />
          ))}
      </div>
    </PageLayout>
  );
}
