'use client';

import { useActionState } from 'react';
import { FieldError } from '@/components/form (deprecated)/field-error';
import { Form } from '@/components/form (deprecated)/form';
import { SubmitButton } from '@/components/form (deprecated)/submit-button';
import { EMPTY_ACTION_STATE } from '@/components/form (deprecated)/utils/to-action-state';
import { Input } from '@/components/input';
import { emailVerification } from '../actions/email-verification';

const EmailVerificationForm = () => {
  const [actionState, action, isPending] = useActionState(
    emailVerification,
    EMPTY_ACTION_STATE
  );

  return (
    <Form action={action} actionState={actionState}>
      <Input type="code" name="code" placeholder="Code" />
      <FieldError actionState={actionState} name="code" />

      <SubmitButton
        isPending={isPending}
        tooltipContent="Verify email"
        aria-label="Verify email"
      >
        Verify Email
      </SubmitButton>
    </Form>
  );
};

export { EmailVerificationForm };
