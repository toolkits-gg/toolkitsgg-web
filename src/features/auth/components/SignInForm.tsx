'use client';

import { Anchor, Group, PasswordInput, Stack, TextInput } from '@mantine/core';
import Link from 'next/link';
import { useActionState } from 'react';
import { EMPTY_ACTION_STATE } from '@/components/form/constants';
import { FieldError } from '@/components/form/FieldError';
import { Form } from '@/components/form/Form';
import { SubmitButton } from '@/components/form/SubmitButton';
import { signUpPath } from '@/paths';
import { signIn } from '../actions/sign-in';

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
          {`Don't have an account? Register`}
        </Anchor>
        <SubmitButton
          isPending={isPending}
          tooltip="Sign in"
          aria-label="Sign in"
        >
          Submit
        </SubmitButton>
      </Group>
    </Form>
  );
};

export { SignInForm };
