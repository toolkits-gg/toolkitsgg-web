'use client';

import { LucideLoaderCircle } from 'lucide-react';
import { cloneElement } from 'react';
import { useFormStatus } from 'react-dom';
import { Button, ButtonProps } from '../ui/button';

type SubmitButtonProps = {
  label?: string;
  icon?: React.ReactElement<HTMLElement>;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  className?: ButtonProps['className'];
};

const SubmitButton = ({
  label,
  icon,
  variant = 'default',
  size = 'default',
  className,
}: SubmitButtonProps) => {
  const { pending } = useFormStatus();

  return (
    <Button
      disabled={pending}
      type="submit"
      variant={variant}
      size={size}
      className={className}
    >
      {pending ? (
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
