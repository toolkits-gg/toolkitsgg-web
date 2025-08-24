import 'server-only';
import { cache } from 'react';
import prisma from '@/lib/prisma';

type GetPasswordResetTokenArgs = {
  tokenHash: string;
};

export const getPasswordResetToken = cache(
  async ({ tokenHash }: GetPasswordResetTokenArgs) => {
    return await prisma.passwordResetToken.findFirst({
      where: { tokenHash },
    });
  }
);
