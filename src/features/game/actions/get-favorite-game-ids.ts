'use server';

import { formUtils } from '@/components/form/utils';
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
    formUtils.fromErrorToActionState({ error });
    return [];
  }
};
