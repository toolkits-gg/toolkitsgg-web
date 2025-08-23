'use server';

import { z } from 'zod';
import type { ActionState } from '@/components/form/types';
import { formUtils } from '@/components/form/utils';
import { authData } from '@/features/auth/data';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';
import { inngest } from '@/lib/inngest';
import { verifyPasswordHash } from '../utils/hash-and-verify';

const passwordChangeSchema = z.object({
  password: z.string().min(6).max(191),
});

export const passwordChange = async (
  _actionState: ActionState,
  formData: FormData
) => {
  const auth = await getAuthOrRedirect();

  try {
    const { password } = passwordChangeSchema.parse({
      password: formData.get('password'),
    });

    const user = await authData.getUser({
      userEmail: auth.user.email,
    });

    if (!user) {
      // we should never reach this return statement
      // but it's here just in case
      return formUtils.toActionState({
        status: 'ERROR',
        message: 'Invalid request',
        formData,
      });
    }

    const validPassword = await verifyPasswordHash(user.passwordHash, password);

    if (!validPassword) {
      return formUtils.toActionState({
        status: 'ERROR',
        message: 'Incorrect password',
        formData,
      });
    }

    await inngest.send({
      name: 'app/password.password-reset',
      data: {
        userId: user.id,
      },
    });
  } catch (error) {
    return formUtils.fromErrorToActionState({ error, formData });
  }

  return formUtils.toActionState({
    status: 'SUCCESS',
    message: 'Check your email for a reset link',
  });
};
