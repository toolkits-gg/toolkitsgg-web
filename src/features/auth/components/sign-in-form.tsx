'use client';

import { useActionState } from 'react';
import { FieldError } from '@/components/form (deprecated)/field-error';
import { Form } from '@/components/form (deprecated)/form';
import { SubmitButton } from '@/components/form (deprecated)/submit-button';
import { EMPTY_ACTION_STATE } from '@/components/form (deprecated)/utils/to-action-state';
import { Input } from '@/components/input';
import { signIn } from '../actions/sign-in';

const SignInForm = () => {
  const [actionState, action, isPending] = useActionState(
    signIn,
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

      <Input
        type="password"
        name="password"
        placeholder="Password"
        defaultValue={actionState.payload?.get('password') as string}
      />
      <FieldError actionState={actionState} name="password" />

      <SubmitButton
        isPending={isPending}
        tooltipContent="Sign in"
        aria-label="Sign in"
      >
        Sign In
      </SubmitButton>
    </Form>
  );
};

export { SignInForm };
