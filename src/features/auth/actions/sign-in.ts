'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { authData } from '@/features/auth/data';
import { verifyPasswordHash } from '@/features/password/utils/hash-and-verify';
import { createSession } from '@/lib/lucia';
import { homePath } from '@/paths';
import { generateRandomToken } from '@/utils/crypto';
import { setSessionCookie } from '../utils/session-cookie';
import type { ActionState } from '@/components/form/types';
import { formUtils } from '@/components/form/utils';

const signInSchema = z.object({
  email: z.string().min(1, { message: 'Is required' }).max(191).email(),
  password: z.string().min(6).max(191),
});

export const signIn = async (_actionState: ActionState, formData: FormData) => {
  try {
    const { email, password } = signInSchema.parse(
      Object.fromEntries(formData)
    );

    const user = await authData.getUser({
      userEmail: email,
      options: {
        omitPasswordHash: false,
      },
    });

    const validPassword = await verifyPasswordHash(
      user ? user.passwordHash : '$argon',
      password
    );

    if (!user || !validPassword) {
      return formUtils.toActionState({
        status: 'ERROR',
        message: 'Incorrect email or password',
        formData,
      });
    }

    const sessionToken = generateRandomToken();
    const session = await createSession(sessionToken, user.id);

    await setSessionCookie(sessionToken, session.expiresAt);
  } catch (error) {
    return formUtils.fromErrorToActionState({ error, formData });
  }

  redirect(homePath());
};
