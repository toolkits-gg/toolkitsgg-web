'use client';

import { Button, Loader, Tooltip, type ButtonProps } from '@mantine/core';

type SubmitButtonProps = Omit<ButtonProps, 'disabled' | 'type'> & {
  icon?: React.ReactElement<HTMLElement>;
  isPending: boolean;
  tooltip: string | undefined;
};

const SubmitButton = ({
  icon,
  isPending,
  children,
  tooltip,
  ...buttonProps
}: SubmitButtonProps) => {
  // ! Cannot get pending from useFormStatus() because a bug currently
  // ! makes it reset when a child component updates its state
  // ! This results in the loader circle not showing correctly.
  // ! Until there is a fix, we pass in isPending from the actionState.
  // const { pending } = useFormStatus();

  return (
    <Tooltip label={tooltip ?? null}>
      <Button {...buttonProps} disabled={isPending} type="submit">
        {isPending ? <Loader size={16} /> : icon || children}
      </Button>
    </Tooltip>
  );
};

export { SubmitButton };
