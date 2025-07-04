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
      <div className="flex w-full flex-col gap-x-0 gap-y-4 xl:flex-row xl:items-start xl:justify-center xl:gap-x-4 xl:gap-y-0">
        <div className="flex items-center justify-start xl:w-[250px] xl:min-w-[250px]">
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          {gameConfig?.items
            ?.filter((item) => item.category === 'SKILL')
            .map((item) => (
              <ItemCard key={item.slug} item={item} gameId={gameConfig.id} />
            ))}
        </div>
      </div>
    </SidebarLayout>
  );
}
