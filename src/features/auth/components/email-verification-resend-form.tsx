'use client';

import { useActionState } from 'react';
import { Form } from '@/components/form/form';
import { SubmitButton } from '@/components/form/submit-button';
import { EMPTY_ACTION_STATE } from '@/components/form/utils/to-action-state';
import { emailVerificationResend } from '../actions/email-verification-resend';

const EmailVerificationResendForm = () => {
  const [actionState, action, isPending] = useActionState(
    emailVerificationResend,
    EMPTY_ACTION_STATE
  );

  return (
    <Form action={action} actionState={actionState}>
      <SubmitButton isPending={isPending}>Resend Code</SubmitButton>
    </Form>
  );
};

export { EmailVerificationResendForm };
