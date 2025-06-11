import Image from 'next/image';
import { PageLayout } from '@/app/_navigation/page-layout';
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
      <div className="col-span-full grid w-full grid-cols-3 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {gameConfig?.items?.map((item) => (
          <ItemCard key={item.slug} item={item} gameId={gameConfig.id} />
        ))}
      </div>
      {/* <Card className="col-span-1 w-full sm:w-[420px]">
        <CardHeader>
          <CardTitle>{gameConfig?.name}</CardTitle>
          <CardDescription>
            Welcome to the {gameConfig?.name} page!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Placeholder page</p>
        </CardContent>
        <CardFooter className="text-muted-foreground text-sm">
          <p>More coming soon!</p>
        </CardFooter>
      </Card> */}
    </PageLayout>
  );
}
