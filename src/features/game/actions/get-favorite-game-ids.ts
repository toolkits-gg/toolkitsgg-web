'use server';

import { fromErrorToActionState } from '@/components/form (deprecated)/utils/to-action-state';
import { getAuth } from '@/features/auth/queries/get-auth';
import { gameData } from '@/features/game/data';

export const getFavoriteGameIds = async (): Promise<string[]> => {
  const { user } = await getAuth();
  if (!user) {
    return [];
  }

  try {
    return await gameData.getFavoriteGameIds();
  } catch (error) {
    fromErrorToActionState({ error });
    return [];
  }
};
