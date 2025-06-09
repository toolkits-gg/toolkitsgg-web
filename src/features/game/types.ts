import { gameConfigs } from '@/features/game/constants';

export type GameConfig<ItemType> = {
  id: GameId;
  name: string;
  description: string | undefined;
  label: string;
  path: string;
  logo: React.ReactElement<HTMLElement>;
  themeCSSClass: string;

  items: ItemType[] | undefined;
  itemLookupPath?: string;
  itemTrackerPath?: string;
  itemQuizPath?: string;

  buildsEnabled?: boolean;
};

export type GameId = keyof typeof gameConfigs;

export function isGameId(id: string): id is GameId {
  return Object.keys(gameConfigs).includes(id);
}

export function toGameId(id: string | undefined): GameId {
  if (!id) {
    return 'none';
  }
  return isGameId(id) ? (id as GameId) : 'none';
}
