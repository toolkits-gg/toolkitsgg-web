import prisma from '@/lib/prisma';

type CreatePasswordResetTokenArgs = {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
};

export async function createPasswordResetToken({
  tokenHash,
  userId,
  expiresAt,
}: CreatePasswordResetTokenArgs) {
  return await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });
}
