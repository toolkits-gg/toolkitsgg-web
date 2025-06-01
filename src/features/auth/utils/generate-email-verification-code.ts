import { createEmailVerificationToken } from '@/features/auth/data/create-email-verification-token';
import { deleteEmailVerificationTokens } from '@/features/auth/data/delete-email-verification-tokens';
import { generateRandomCode } from '@/utils/crypto';

const EMAIL_VERIFICATION_TOKEN_LIFETIME_MS = 1000 * 60 * 15; // 15 minutes

export const generateEmailVerificationCode = async (
  userId: string,
  email: string
) => {
  await deleteEmailVerificationTokens({ userId });

  const code = generateRandomCode();

  await createEmailVerificationToken({
    userId,
    email,
    code,
    expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_LIFETIME_MS),
  });

  return code;
};
