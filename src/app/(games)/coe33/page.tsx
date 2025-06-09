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
import { imagePath } from '@/features/game/games/coe33/paths';

export default async function GamePage() {
  const gameConfig = allGameConfigs.find((config) => config.id === 'coe33');

  if (!gameConfig) {
    throw new Error('Game configuration not found');
  }

  return (
    <PageLayout
      gameId={gameConfig?.id}
      headerImage={
        <Image
          src={imagePath(`backgrounds/T_UI_Level_Lumiere.webp`)}
          alt="Background"
          width={1500}
          height={810}
        />
      }
    >
      <Card className="col-span-1 w-[420px]">
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
      </Card>
    </PageLayout>
  );
}
