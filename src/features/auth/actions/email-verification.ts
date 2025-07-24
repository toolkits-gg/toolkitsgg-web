'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { setCookieByKey } from '@/actions/cookies';
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { authData } from '@/features/auth/data';
import { createSession } from '@/lib/lucia';
import { homePath } from '@/paths';
import { generateRandomToken } from '@/utils/crypto';
import { getAuthOrRedirect } from '../queries/get-auth-or-redirect';
import { setSessionCookie } from '../utils/session-cookie';
import { validateEmailVerificationCode } from '../utils/validate-email-verification-code';

const emailVerificationSchema = z.object({
  code: z.string().length(8),
});

export const emailVerification = async (
  _actionState: ActionState,
  formData: FormData
) => {
  const { user } = await getAuthOrRedirect({
    checkEmailVerified: false,
  });

  try {
    const { code } = emailVerificationSchema.parse({
      code: formData.get('code'),
    });

    const validCode = await validateEmailVerificationCode(
      user.id,
      user.email,
      code
    );

    if (!validCode) {
      return toActionState({
        status: 'ERROR',
        message: 'Invalid or expired code',
      });
    }

    await authData.deleteUserSessions({ userId: user.id });

    await authData.updateUser({
      userId: user.id,
      data: { emailVerified: true },
    });

    const sessionToken = generateRandomToken();
    const session = await createSession(sessionToken, user.id);

    await setSessionCookie(sessionToken, session.expiresAt);
  } catch (error) {
    return fromErrorToActionState({ error });
  }

  await setCookieByKey('toast', 'Email verified');
  // TODO: Redirect to a more appropriate page, like the dashboard or profile
  redirect(homePath());
};
