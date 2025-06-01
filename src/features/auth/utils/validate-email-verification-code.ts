import { deleteEmailVerificationTokens } from '@/features/auth/data/delete-email-verification-tokens';
import { getEmailVerificationToken } from '@/features/auth/data/get-email-verification-token';

export const validateEmailVerificationCode = async (
  userId: string,
  email: string,
  code: string
) => {
  const emailVerificationToken = await getEmailVerificationToken({
    userId,
  });

  if (!emailVerificationToken || emailVerificationToken.code !== code) {
    return false;
  }

  await deleteEmailVerificationTokens({
    id: emailVerificationToken.id,
  });

  const isExpired = Date.now() > emailVerificationToken.expiresAt.getTime();
  if (isExpired) {
    return false;
  }

  if (emailVerificationToken.email !== email) {
    return false;
  }

  return true;
};
