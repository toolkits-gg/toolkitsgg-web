import { LucideSailboat } from 'lucide-react';
import Image from 'next/image';
import { AppSidebar } from '@/app/_navigation/app-sidebar';
import { HeaderImage } from '@/app/_navigation/header-image';
import { Button } from '@/components/button';
import { Navbar } from '@/components/navbar';
import { SidebarLayout } from '@/components/sidebar-layout';
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
    <SidebarLayout
      sidebar={<AppSidebar gameId="coe33" />}
      navbar={<Navbar>Navigation</Navbar>}
    >
      <div className="flex w-full flex-1 flex-col gap-y-2">
        <div className="flex w-full flex-1 items-center justify-start">
          <HeaderImage
            image={
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
            title={gameConfig?.name}
            text={gameConfig?.description}
          />
        </div>
        <div className="col-span-full flex w-full flex-wrap items-center justify-between gap-2">
          {gameConfig?.items
            ?.filter((item) => item.category === 'SKILL')
            .map((item) => (
              <ItemCard
                key={item.slug}
                item={item}
                gameId={gameConfig.id}
                actions={
                  <Button plain>
                    <LucideSailboat className="h-4 w-4" />
                  </Button>
                }
              />
            ))}
        </div>
      </div>
    </SidebarLayout>
  );
}
