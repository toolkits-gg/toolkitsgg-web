'use server';

import { Prisma } from '@prisma/client';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { ActionState } from '@/components/form/types';
import { formUtils } from '@/components/form/utils';
import { authData } from '@/features/auth/data';
import { hashPassword } from '@/features/password/utils/hash-and-verify';
import { inngest } from '@/lib/inngest';
import { createSession } from '@/lib/lucia';
import { homePath } from '@/paths';
import { generateRandomToken } from '@/utils/crypto';
import { setSessionCookie } from '../utils/session-cookie';

const signUpSchema = z
  .object({
    username: z
      .string()
      .min(1)
      .max(191)
      .refine(
        (value) => !value.includes(' '),
        'Username cannot contain spaces'
      ),
    email: z.string().min(1, { message: 'Is required' }).max(191).email(),
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

export const signUp = async (_actionState: ActionState, formData: FormData) => {
  try {
    const { username, email, password } = signUpSchema.parse(
      Object.fromEntries(formData)
    );

    const passwordHash = await hashPassword(password);

    const user = await authData.createUser({
      username,
      email,
      passwordHash,
    });

    await inngest.send({
      name: 'app/auth.sign-up',
      data: {
        userId: user.id,
      },
    });

    const sessionToken = generateRandomToken();
    const session = await createSession(sessionToken, user.id);

    await setSessionCookie(sessionToken, session.expiresAt);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return formUtils.toActionState({
        status: 'ERROR',
        message: 'Either email or username is already in use',
        formData,
      });
    }

    return formUtils.fromErrorToActionState({ error, formData });
  }

  redirect(homePath());
};
