'use client';

import { useActionState } from 'react';
import { FieldError } from '@/components/form (deprecated)/field-error';
import { Form } from '@/components/form (deprecated)/form';
import { SubmitButton } from '@/components/form (deprecated)/submit-button';
import { EMPTY_ACTION_STATE } from '@/components/form (deprecated)/utils/to-action-state';
import { Input } from '@/components/input';
import { passwordForgot } from '../actions/password-forgot';

const PasswordForgotForm = () => {
  const [actionState, action, isPending] = useActionState(
    passwordForgot,
    EMPTY_ACTION_STATE
  );

  return (
    <Form action={action} actionState={actionState}>
      <Input
        name="email"
        placeholder="Email"
        defaultValue={actionState.payload?.get('email') as string}
      />
      <FieldError actionState={actionState} name="email" />

      <SubmitButton
        isPending={isPending}
        tooltipContent="Send email"
        aria-label="Send email"
      >
        Send Email
      </SubmitButton>
    </Form>
  );
};

export { PasswordForgotForm };
