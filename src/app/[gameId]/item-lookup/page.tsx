import { isGameId, toGameConfig } from '@/features/game/utils/game-id';

type ItemLookupPageProps = {
  params: Promise<{ gameId: string }>;
};

export default async function ItemCollectorPage({
  params,
}: ItemLookupPageProps) {
  const { gameId } = await params;
  const isGameIdValid = isGameId(gameId);

  if (!isGameIdValid) {
    throw new Error(`Invalid game id: ${gameId}`);
  }

  const gameConfig = toGameConfig(gameId);

  if (!gameConfig) {
    throw new Error(`Game configuration not found for game id ${gameId}!`);
  }

  if (!gameConfig.pages?.itemLookup) {
    throw new Error(
      `Game configuration for game id ${gameId} is missing page components!`
    );
  }

  return gameConfig.pages.itemLookup.component;
}
