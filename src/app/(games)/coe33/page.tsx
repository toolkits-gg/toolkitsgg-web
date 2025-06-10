import Image from 'next/image';
import { PageLayout } from '@/app/_navigation/page-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { allGameConfigs } from '@/features/game/constants';
import type { COE33ItemType } from '@/features/game/games/coe33/items';
import type { GameConfig } from '@/features/game/types';
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
      <div className="col-span-full grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gameConfig?.items?.map((item) => (
          <Card key={item.slug} className="w-full">
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Image
                src={getImageUrl(item.imageUrl, gameConfig.id)}
                alt={item.name}
                width={200}
                height={200}
              />
            </CardContent>
            <CardFooter className="text-muted-foreground text-sm">
              <p>Actions</p>
            </CardFooter>
          </Card>
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
