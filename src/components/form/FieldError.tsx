import { Text } from '@mantine/core';
import type { ActionState } from '@/components/form/types';

type FieldErrorProps = {
  actionState: ActionState;
  name: string;
};

const FieldError = ({ actionState, name }: FieldErrorProps) => {
  const message = actionState.fieldErrors[name]?.[0];

  if (!message) return null;

  return (
    <Text size="sm" c="error">
      {message}
    </Text>
  );
};

export { FieldError };
