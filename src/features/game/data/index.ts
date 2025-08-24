import 'server-only';
import * as getFavoriteGameIds from './get-favorite-game-ids';
import * as toggleFavoriteGame from './toggle-favorite-game';
import * as addFavoriteGame from './toggle-favorite-game';

export const gameData = {
  ...addFavoriteGame,
  ...getFavoriteGameIds,
  ...toggleFavoriteGame,
};
