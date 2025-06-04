import { authData } from '@/features/auth/data';

export const validateEmailVerificationCode = async (
  userId: string,
  email: string,
  code: string
) => {
  const emailVerificationToken = await authData.getEmailVerificationToken({
    userId,
  });

  if (!emailVerificationToken || emailVerificationToken.code !== code) {
    return false;
  }

  await authData.deleteEmailVerificationTokens({
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
