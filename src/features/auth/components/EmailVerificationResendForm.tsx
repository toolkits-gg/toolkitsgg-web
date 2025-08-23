'use client';

import { useActionState } from 'react';
import { EMPTY_ACTION_STATE } from '@/components/form/constants';
import { Form } from '@/components/form/Form';
import { SubmitButton } from '@/components/form/SubmitButton';
import { emailVerificationResend } from '../actions/email-verification-resend';

const EmailVerificationResendForm = () => {
  const [actionState, action, isPending] = useActionState(
    emailVerificationResend,
    EMPTY_ACTION_STATE
  );

  return (
    <Form action={action} actionState={actionState}>
      <SubmitButton
        isPending={isPending}
        tooltip="Resend code"
        aria-label="Resend code"
      >
        Resend Code
      </SubmitButton>
    </Form>
  );
};

export { EmailVerificationResendForm };
