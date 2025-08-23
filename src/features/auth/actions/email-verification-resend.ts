'use server';

import { formUtils } from '@/components/form/utils';
import { sendEmailVerification } from '../emails/send-email-verification';
import { getAuthOrRedirect } from '../queries/get-auth-or-redirect';
import { canResendVerificationEmail } from '../utils/can-resend-verification-email';
import { generateEmailVerificationCode } from '../utils/generate-email-verification-code';

export const emailVerificationResend = async () => {
  const { user } = await getAuthOrRedirect({
    checkEmailVerified: false,
  });

  try {
    const canResend = await canResendVerificationEmail(user.id);
    if (!canResend) {
      return formUtils.toActionState({
        status: 'ERROR',
        message:
          'You can only resend the verification email once every minute.',
      });
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
      return formUtils.toActionState({
        status: 'ERROR',
        message: 'Failed to send verification email',
      });
    }
  } catch (error) {
    return formUtils.fromErrorToActionState({ error });
  }

  return formUtils.toActionState({
    status: 'SUCCESS',
    message: 'Verification email has been sent',
  });
};
