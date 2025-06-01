import { differenceInSeconds } from 'date-fns';
import { getEmailVerificationToken } from '@/features/auth/data/get-email-verification-token';

export const canResendVerificationEmail = async (userId: string) => {
  const verificationToken = await getEmailVerificationToken({
    userId,
  });

  if (!verificationToken) {
    return true;
  }

  const diff = differenceInSeconds(
    new Date(),
    new Date(verificationToken.createdAt)
  );

  return diff > 60;
};
