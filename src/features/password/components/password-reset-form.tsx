'use client';

import { useActionState } from 'react';
import { FieldError } from '@/components/form (deprecated)/field-error';
import { Form } from '@/components/form (deprecated)/form';
import { SubmitButton } from '@/components/form (deprecated)/submit-button';
import { EMPTY_ACTION_STATE } from '@/components/form (deprecated)/utils/to-action-state';
import { Input } from '@/components/input';
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
      <Input
        type="password"
        name="password"
        placeholder="Password"
        defaultValue={actionState.payload?.get('password') as string}
      />
      <FieldError actionState={actionState} name="password" />

      <Input
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        defaultValue={actionState.payload?.get('confirmPassword') as string}
      />
      <FieldError actionState={actionState} name="confirmPassword" />

      <SubmitButton
        isPending={isPending}
        tooltipContent="Reset password"
        aria-label="Reset password"
      >
        Reset Password
      </SubmitButton>
    </Form>
  );
};

export { PasswordResetForm };
