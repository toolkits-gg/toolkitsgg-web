import prisma from '@/lib/prisma';

type GetPasswordResetTokenArgs = {
  tokenHash: string;
};

export async function getPasswordResetToken({
  tokenHash,
}: GetPasswordResetTokenArgs) {
  return await prisma.passwordResetToken.findFirst({
    where: { tokenHash },
  });
}
