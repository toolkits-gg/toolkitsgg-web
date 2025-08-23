import { gameUtils } from '@/features/game/utils';

type GameHomePageProps = {
  params: Promise<{ gameId: string }>;
};

// need a type guard for gameId as GameId

export default async function GameHomePage({ params }: GameHomePageProps) {
  const { gameId } = await params;
  const isGameIdValid = gameUtils.isGameId(gameId);

  if (!isGameIdValid) {
    throw new Error(`Invalid game id: ${gameId}`);
  }

  const gameConfig = gameUtils.toGameConfig(gameId);

  if (!gameConfig) {
    throw new Error(`Game configuration not found for game id ${gameId}!`);
  }

  if (!gameConfig.pages?.home) {
    throw new Error(
      `Game configuration for game id ${gameId} is missing page components!`
    );
  }

  return gameConfig.pages.home.component;
}
