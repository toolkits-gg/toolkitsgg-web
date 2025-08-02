'use client';

import { useActionState } from 'react';
import { FieldError } from '@/components/form/field-error';
import { Form } from '@/components/form/form';
import { SubmitButton } from '@/components/form/submit-button';
import { EMPTY_ACTION_STATE } from '@/components/form/utils/to-action-state';
import { Input } from '@/components/input';
import { passwordChange } from '../actions/password-change';

const PasswordChangeForm = () => {
  const [actionState, action, isPending] = useActionState(
    passwordChange,
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

      <SubmitButton
        isPending={isPending}
        tooltipContent="Send email"
        aria-labe="Send email"
      >
        Send Email
      </SubmitButton>
    </Form>
  );
};

export { PasswordChangeForm };
