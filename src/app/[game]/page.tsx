import { SidebarProvider } from '@/app/_navigation/sidebar-provider';
import { allGameConfigs } from '@/features/games/constants';
import { redirect } from 'next/navigation';

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
    <SidebarProvider gameId={gameId}>
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex h-full w-full items-center justify-center">
          <h1 className="text-2xl font-bold text-red-500">
            Game Page: {gameId}
          </h1>
        </div>
      </main>
    </SidebarProvider>
  );
}
