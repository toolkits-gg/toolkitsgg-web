'use client';

import { TextInput } from '@mantine/core';
import { useActionState } from 'react';
import { EMPTY_ACTION_STATE } from '@/components/form/constants';
import { FieldError } from '@/components/form/FieldError';
import { Form } from '@/components/form/Form';
import { SubmitButton } from '@/components/form/SubmitButton';
import { passwordReset } from '../actions/password-reset';

type PasswordResetFormProps = {
  tokenId: string;
};

const PasswordResetForm = ({ tokenId }: PasswordResetFormProps) => {
  const [actionState, action, isPending] = useActionState(
    passwordReset.bind(null, tokenId),
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

      <TextInput
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        defaultValue={actionState.payload?.get('confirmPassword') as string}
      />
      <FieldError actionState={actionState} name="confirmPassword" />

      <SubmitButton
        isPending={isPending}
        tooltip="Reset password"
        aria-label="Reset password"
      >
        Reset Password
      </SubmitButton>
    </Form>
  );
};

export { PasswordResetForm };
