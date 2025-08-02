'use client';

import { LucideLoaderCircle } from 'lucide-react';
import { cloneElement } from 'react';
import { type CatalystButtonProps } from '@/components/catalyst-button';
import { Button } from '@/components/button';

type SubmitButtonProps = Omit<CatalystButtonProps, 'disabled' | 'type'> & {
  icon?: React.ReactElement<HTMLElement>;
  isPending: boolean;
  tooltipContent: React.ReactNode | undefined;
};

const SubmitButton = ({
  icon,
  isPending,
  tooltipContent,
  children,
  ...buttonProps
}: SubmitButtonProps) => {
  // ! Cannot get pending from useFormStatus() because a bug currently
  // ! makes it reset when a child component updates its state
  // ! This results in the loader circle not showing correctly.
  // ! Until there is a fix, we pass in isPending from the actionState.
  // const { pending } = useFormStatus();

  // Remove color prop if plain is true to satisfy ButtonProps requirements
  const { plain, color, ...restButtonProps } = buttonProps as any;
  const safeButtonProps = plain
    ? { ...restButtonProps, plain: true }
    : { ...restButtonProps, color };

  return (
    <Button
      {...safeButtonProps}
      disabled={isPending}
      type="submit"
      tooltipContent={tooltipContent}
    >
      {isPending ? (
        <LucideLoaderCircle className="h-4 w-4 animate-spin" />
      ) : icon ? (
        <>
          {cloneElement(icon, {
            className: 'w-4 h-4',
          })}
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export { SubmitButton };
