import { redirect } from 'next/navigation';
import { PageContainer } from '@/app/_navigation/page-container';
import { allGameConfigs } from '@/features/game/constants';

type GamePageProps = {
  params: Promise<{
    game: string;
  }>;
};

export default async function GamePage({ params }: GamePageProps) {
  const { game } = await params;

  const gameId = allGameConfigs.find((config) => config.id === game)
    ? game
    : null;
  if (!gameId) {
    redirect('/');
  }

  return (
    <PageContainer gameId={gameId}>
      <div className="flex h-full w-full items-center justify-center">
        <h1 className="text-2xl font-bold text-red-500">Game Page: {gameId}</h1>
      </div>
    </PageContainer>
  );
}
