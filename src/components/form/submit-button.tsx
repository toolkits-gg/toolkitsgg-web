'use client';

import { LucideLoaderCircle } from 'lucide-react';
import { cloneElement } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/button';

type SubmitButtonProps = {
  label?: string;
  icon?: React.ReactElement<HTMLElement>;
  className?: string;
};

const SubmitButton = ({ label, icon, className }: SubmitButtonProps) => {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit" className={className}>
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
