import type { ActionState } from '@/components/form/utils/action-state';

type FieldErrorProps = {
  actionState: ActionState;
  name: string;
};

const FieldError = ({ actionState, name }: FieldErrorProps) => {
  const message = actionState.fieldErrors[name]?.[0];

  if (!message) return null;

  return <span>{message}</span>;
};

export { FieldError };
