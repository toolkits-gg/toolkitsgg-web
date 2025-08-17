'use client';

import { useActionState } from 'react';
import { signIn } from '../actions/sign-in';
import { Form } from '@/components/form/Form';
import { Anchor, Group, PasswordInput, Stack, TextInput } from '@mantine/core';
import { FieldError } from '@/components/form/FieldError';
import { SubmitButton } from '@/components/form/SubmitButton';
import { EMPTY_ACTION_STATE } from '@/components/form/constants';
import Link from 'next/link';
import { signUpPath } from '@/paths';

const SignInForm = () => {
  const [actionState, action, isPending] = useActionState(
    signIn,
    EMPTY_ACTION_STATE
  );

  return (
    <Form action={action} actionState={actionState}>
      <Stack>
        <TextInput
          required
          name="email"
          placeholder="Email"
          label="Email"
          defaultValue={actionState.payload?.get('email') as string}
          radius="md"
        />
        <FieldError actionState={actionState} name="email" />

        <PasswordInput
          required
          label="Password"
          name="password"
          placeholder="Password"
          defaultValue={actionState.payload?.get('password') as string}
          radius="md"
        />
        <FieldError actionState={actionState} name="password" />
      </Stack>

      <Group justify="space-between" mt="xl">
        <Anchor component={Link} href={signUpPath()} c="dimmed" size="xs">
          Don't have an account? Register
        </Anchor>
        <SubmitButton
          isPending={isPending}
          tooltip="Sign In"
          aria-label="Sign in"
        >
          Submit
        </SubmitButton>
      </Group>
    </Form>
  );
};

export { SignInForm };
