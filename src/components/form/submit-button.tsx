'use client';

import { LucideLoaderCircle } from 'lucide-react';
import { cloneElement } from 'react';
import { Button, type ButtonProps } from '@/components/button';

type SubmitButtonProps = {
  label?: string;
  icon?: React.ReactElement<HTMLElement>;
  className?: ButtonProps['className'];
  color?: ButtonProps['color'];
  isPending: boolean;
};

const SubmitButton = ({
  color,
  label,
  icon,
  isPending,
  className,
}: SubmitButtonProps) => {
  // ! Cannot get pending from useFormStatus() because a bug currently
  // ! makes it reset when a child component updates its state
  // ! This results in the loader circle not showing correctly.
  // ! Until there is a fix, we pass in isPending from the actionState.
  // const { pending } = useFormStatus();

  return (
    <Button
      color={color}
      disabled={isPending}
      type="submit"
      className={className}
    >
      {isPending ? (
        <LucideLoaderCircle className="h-4 w-4 animate-spin" />
      ) : icon ? (
        <>
          {cloneElement(icon, {
            className: 'w-4 h-4',
          })}
        </>
      ) : null}
      {label}
    </Button>
  );
};

export { SubmitButton };
