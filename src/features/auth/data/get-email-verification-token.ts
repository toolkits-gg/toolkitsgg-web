import 'server-only';
import { cache } from 'react';
import prisma from '@/lib/prisma';

type GetEmailVerificationTokenArgs = {
  userId: string;
};

export const getEmailVerificationToken = cache(
  async ({ userId }: GetEmailVerificationTokenArgs) => {
    return await prisma.emailVerificationToken.findFirst({
      where: { userId },
    });
  }
);
