'use server';

import { z } from 'zod';
import type { ActionState } from '@/components/form/types';
import { formUtils } from '@/components/form/utils';
import { authData } from '@/features/auth/data';
import { inngest } from '@/lib/inngest';

const passwordForgotSchema = z.object({
  email: z.string().min(1, { message: 'Is required' }).max(191).email(),
});

export const passwordForgot = async (
  _actionState: ActionState,
  formData: FormData
) => {
  try {
    const { email } = passwordForgotSchema.parse({
      email: formData.get('email'),
    });

    const user = await authData.getUser({
      userEmail: email,
    });

    if (!user) {
      return formUtils.toActionState({
        status: 'SUCCESS',
        message: 'Check your email for a reset link',
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
