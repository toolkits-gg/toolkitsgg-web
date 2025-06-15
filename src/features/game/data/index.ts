import * as getFavoriteGames from './get-favorite-games';
import * as toggleFavoriteGame from './toggle-favorite-game';
import * as addFavoriteGame from './toggle-favorite-game';

export const gameData = {
  ...addFavoriteGame,
  ...getFavoriteGames,
  ...toggleFavoriteGame,
};
