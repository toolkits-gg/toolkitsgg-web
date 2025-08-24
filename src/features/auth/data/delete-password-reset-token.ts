import 'server-only';
import prisma from '@/lib/prisma';

type DeletePasswordResetTokenArgs =
  | {
      tokenHash?: string;
      userId?: never;
    }
  | {
      tokenHash?: never;
      userId?: string;
    };

export async function deletePasswordResetToken({
  tokenHash,
  userId,
}: DeletePasswordResetTokenArgs) {
  await prisma.passwordResetToken.deleteMany({
    where: { tokenHash, userId },
  });
}
