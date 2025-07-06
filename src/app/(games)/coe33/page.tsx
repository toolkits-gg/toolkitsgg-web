import { AppSidebar } from '@/app/_navigation/components/app-sidebar';
import { HeaderImage } from '@/app/_navigation/components/header-image';
import { SidebarLayout } from '@/components/sidebar-layout';
import { allGameConfigs } from '@/features/game/constants';
import type { COE33ItemType } from '@/features/game/games/coe33/items';
import type { GameConfig } from '@/features/game/types';
import { ItemCard } from '@/features/item/components/item-card';
import { getImageUrl } from '@/utils/url';
import Image from 'next/image';

export default async function GamePage() {
  const gameConfig = allGameConfigs.find((config) => config.id === 'coe33') as
    | GameConfig<COE33ItemType>
    | undefined;

  if (!gameConfig) {
    throw new Error('Game configuration not found');
  }

  return (
    <SidebarLayout sidebar={<AppSidebar gameConfig={gameConfig} />}>
      <div className="flex w-full flex-col gap-x-0 gap-y-4 xl:flex-row xl:items-start xl:justify-center xl:gap-x-4 xl:gap-y-0">
        <div className="flex w-full items-center justify-start xl:order-2 xl:w-[250px] xl:min-w-[250px] xl:pt-2">
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
        <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-4 p-6 sm:justify-between lg:p-2">
          {gameConfig?.items
            ?.filter((item) => item.category === 'SKILL')
            .map((item) => (
              <ItemCard
                key={item.slug}
                item={item}
                src={getImageUrl(item.imageUrl, 'coe33')}
              />
            ))}
        </div>
      </div>
    </SidebarLayout>
  );
}
