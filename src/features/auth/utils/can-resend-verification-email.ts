import { differenceInSeconds } from 'date-fns';
import { authData } from '@/features/auth/data';

export const canResendVerificationEmail = async (userId: string) => {
  const verificationToken = await authData.getEmailVerificationToken({
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
