import { redirect } from 'next/navigation';
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
import { toGameId } from '@/features/game/types';

type GamePageProps = {
  params: Promise<{
    gameId: string;
  }>;
};

export default async function GamePage({ params }: GamePageProps) {
  const { gameId } = await params;

  if (!gameId) {
    redirect('/');
  }

  const validGameId = toGameId(gameId);

  const gameConfig = allGameConfigs.find((config) => config.id === validGameId);

  return (
    <PageLayout gameId={validGameId}>
      <div className="flex h-full w-full items-center justify-center">
        <Card className="w-[420px]">
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
      </div>
    </PageLayout>
  );
}
