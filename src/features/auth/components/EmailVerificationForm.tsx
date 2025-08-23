'use client';

import { TextInput } from '@mantine/core';
import { useActionState } from 'react';
import { EMPTY_ACTION_STATE } from '@/components/form/constants';
import { FieldError } from '@/components/form/FieldError';
import { Form } from '@/components/form/Form';
import { SubmitButton } from '@/components/form/SubmitButton';
import { emailVerification } from '../actions/email-verification';

const EmailVerificationForm = () => {
  const [actionState, action, isPending] = useActionState(
    emailVerification,
    EMPTY_ACTION_STATE
  );

  return (
    <Form action={action} actionState={actionState}>
      <TextInput type="code" name="code" placeholder="Code" />
      <FieldError actionState={actionState} name="code" />

      <SubmitButton
        isPending={isPending}
        tooltip="Verify email"
        aria-label="Verify email"
      >
        Verify Email
      </SubmitButton>
    </Form>
  );
};

export { EmailVerificationForm };
