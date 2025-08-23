'use client';

import { TextInput } from '@mantine/core';
import { useActionState } from 'react';
import { EMPTY_ACTION_STATE } from '@/components/form/constants';
import { FieldError } from '@/components/form/FieldError';
import { Form } from '@/components/form/Form';
import { SubmitButton } from '@/components/form/SubmitButton';
import { passwordChange } from '../actions/password-change';

const PasswordChangeForm = () => {
  const [actionState, action, isPending] = useActionState(
    passwordChange,
    EMPTY_ACTION_STATE
  );

  return (
    <Form action={action} actionState={actionState}>
      <TextInput
        type="password"
        name="password"
        placeholder="Password"
        defaultValue={actionState.payload?.get('password') as string}
      />
      <FieldError actionState={actionState} name="password" />

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

export { PasswordChangeForm };
