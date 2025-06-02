import { redirect } from 'next/navigation';
import { PageContainer } from '@/app/_navigation/page-container';
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

  return (
    <PageContainer gameId={validGameId}>
      <div className="flex h-full w-full items-center justify-center">
        <h1 className="text-2xl font-bold text-red-500">
          Game Page: {validGameId}
        </h1>
      </div>
    </PageContainer>
  );
}
