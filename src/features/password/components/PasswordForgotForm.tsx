'use client';

import { TextInput } from '@mantine/core';
import { useActionState } from 'react';
import { EMPTY_ACTION_STATE } from '@/components/form/constants';
import { FieldError } from '@/components/form/FieldError';
import { Form } from '@/components/form/Form';
import { SubmitButton } from '@/components/form/SubmitButton';
import { passwordForgot } from '../actions/password-forgot';

const PasswordForgotForm = () => {
  const [actionState, action, isPending] = useActionState(
    passwordForgot,
    EMPTY_ACTION_STATE
  );

  return (
    <Form action={action} actionState={actionState}>
      <TextInput
        name="email"
        placeholder="Email"
        defaultValue={actionState.payload?.get('email') as string}
      />
      <FieldError actionState={actionState} name="email" />

      <SubmitButton
        isPending={isPending}
        tooltip="Send email"
        aria-label="Send email"
      >
        Send Email
      </SubmitButton>
    </Form>
  );
};

export { PasswordForgotForm };
