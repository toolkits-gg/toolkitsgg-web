import { AppSidebar } from '@/app/_navigation/components/app-sidebar';
import { HeaderImage } from '@/app/_navigation/components/header-image';
import { SidebarLayout } from '@/components/sidebar-layout';
import { getCollectedItemSlugs } from '@/features/collection/actions/get-collected-item-slugs';
import { getImageUrl } from '@/utils/url';
import Image from 'next/image';
import { toGameConfig } from '@/features/game/utils/game-id';
import { CollectibleItemCard } from '@/features/item/components/collectible-item-card';
import type { COE33ItemType } from '@/games/coe33/items/types';

// TODO: Need to fetch the user's tracked items

export default async function ItemTrackerPage() {
  const gameConfig = toGameConfig<COE33ItemType>('coe33');

  if (!gameConfig) {
    throw new Error('Game configuration not found');
  }

  if (!gameConfig.items) {
    throw new Error('No items found for the game configuration');
  }

  const collectedItemSlugs = await getCollectedItemSlugs(gameConfig);

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
          {gameConfig.items
            .filter((item) => item.category === 'SKILL')
            .map((item) => (
              <CollectibleItemCard
                key={item.slug}
                item={{
                  ...item,
                  collected: collectedItemSlugs.some(
                    (collectedItemSlug) => collectedItemSlug === item.slug
                  ),
                }}
                imageSrc={getImageUrl(item.imageUrl, 'coe33')}
                gameId={gameConfig.id}
              />
            ))}
        </div>
      </div>
    </SidebarLayout>
  );
}
