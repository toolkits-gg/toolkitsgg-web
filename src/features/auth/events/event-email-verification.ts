import { getUser } from '@/features/auth/data/get-user';
import { inngest } from '@/lib/inngest';
import { sendEmailVerification } from '../emails/send-email-verification';
import { generateEmailVerificationCode } from '../utils/generate-email-verification-code';

export type EmailVerificationEventArgs = {
  data: {
    userId: string;
  };
};

export const emailVerificationEvent = inngest.createFunction(
  { id: 'email-verification' },
  { event: 'app/auth.sign-up' },
  async ({ event }) => {
    const { userId } = event.data;

    const user = await getUser({
      userId,
    });

    if (!user) {
      throw new Error('User not found');
    }

    const verificationCode = await generateEmailVerificationCode(
      user.id,
      user.email
    );

    const result = await sendEmailVerification(
      user.username,
      user.email,
      verificationCode
    );

    if (result.error) {
      throw new Error(`${result.error.name}: ${result.error.message}`);
    }

    return { event, body: result };
  }
);
