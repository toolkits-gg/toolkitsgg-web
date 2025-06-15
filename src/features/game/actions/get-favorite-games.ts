'use server';

import { fromErrorToActionState } from '@/components/form/utils/to-action-state';
import { getAuth } from '@/features/auth/queries/get-auth';
import { gameData } from '@/features/game/data';

export const getFavoriteGames = async (): Promise<string[]> => {
  const { user } = await getAuth();
  if (!user) {
    return [];
  }

  try {
    return await gameData.getFavoriteGames();
  } catch (error) {
    fromErrorToActionState(error);
    return [];
  }
};
