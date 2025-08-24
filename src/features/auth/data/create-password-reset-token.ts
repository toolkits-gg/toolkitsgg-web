import 'server-only';
import prisma from '@/lib/prisma';

type CreatePasswordResetTokenArgs = {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
};

export const createPasswordResetToken = async ({
  tokenHash,
  userId,
  expiresAt,
}: CreatePasswordResetTokenArgs) => {
  return await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });
};
