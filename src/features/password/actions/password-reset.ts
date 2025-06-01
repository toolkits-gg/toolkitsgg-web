'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { setCookieByKey } from '@/actions/cookies';
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { deletePasswordResetToken } from '@/features/auth/data/delete-password-reset-token';
import { deleteUserSessions } from '@/features/auth/data/delete-user-sessions';
import { getPasswordResetToken } from '@/features/auth/data/get-password-reset-token';
import { updateUser } from '@/features/auth/data/update-user';
import { signInPath } from '@/paths';
import { hashToken } from '@/utils/crypto';
import { hashPassword } from '../utils/hash-and-verify';

const passwordResetSchema = z
  .object({
    password: z.string().min(6).max(191),
    confirmPassword: z.string().min(6).max(191),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      });
    }
  });

export const passwordReset = async (
  tokenId: string,
  _actionState: ActionState,
  formData: FormData
) => {
  try {
    const { password } = passwordResetSchema.parse({
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    });

    const tokenHash = hashToken(tokenId);

    const passwordResetToken = await getPasswordResetToken({
      tokenHash,
    });

    if (passwordResetToken) {
      await deletePasswordResetToken({
        tokenHash: passwordResetToken.tokenHash,
      });
    }

    if (
      !passwordResetToken ||
      Date.now() > passwordResetToken.expiresAt.getTime()
    ) {
      return toActionState(
        'ERROR',
        'Expired or invalid verification token',
        formData
      );
    }

    await deleteUserSessions({
      userId: passwordResetToken.userId,
    });

    const passwordHash = await hashPassword(password);

    await updateUser({
      userId: passwordResetToken.userId,
      data: {
        passwordHash,
      },
    });
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }

  await setCookieByKey('toast', 'Successfully reset password');
  redirect(signInPath());
};
