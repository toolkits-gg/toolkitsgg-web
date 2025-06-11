import { cn } from '@/lib/utils';

type TypographyProps = {
  children?: React.ReactNode;
  className?: string;
  variant?:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'p'
    | 'body'
    | 'blockquote'
    | 'code'
    | 'lead'
    | 'large'
    | 'small'
    | 'muted';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
};

const Typography = ({
  children,
  className,
  variant,
  color,
}: TypographyProps) => {
  const baseClasses = 'font-sans';
  const variantClasses = {
    h1: 'scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance',
    h2: 'scroll-m-20 border-b border-primary pb-2 text-3xl font-semibold tracking-tight first:mt-0',
    h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
    h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
    p: 'leading-7 [&:not(:first-child)]:mt-6',
    body: 'leading-7',
    blockquote: 'mt-6 border-l-2 pl-6 italic',
    code: 'bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
    lead: 'text-muted-foreground text-xl',
    large: 'text-lg font-semibold',
    small: 'text-sm leading-none font-medium',
    muted: 'text-muted-foreground/70 text-sm',
  };
  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    error: 'text-error-600',
    warning: 'text-warning-600',
    info: 'text-info-600',
    success: 'text-success-600',
  };

  const classes = cn([
    baseClasses,
    variant && variantClasses[variant],
    color && colorClasses[color],
    className && className,
  ]);

  let Tag: React.ElementType = 'p';
  switch (variant) {
    case 'h1':
      Tag = 'h1';
      break;
    case 'h2':
      Tag = 'h2';
      break;
    case 'h3':
      Tag = 'h3';
      break;
    case 'h4':
      Tag = 'h4';
      break;
    case 'blockquote':
      Tag = 'blockquote';
      break;
    case 'code':
      Tag = 'code';
      break;
    case 'p':
      Tag = 'p';
      break;
    case 'body':
      Tag = 'p';
    case 'lead':
      Tag = 'p';
      break;
    case 'large':
      Tag = 'p';
      break;
    case 'small':
      Tag = 'small';
      break;
    case 'muted':
      Tag = 'p';
      break;
  }

  return <Tag className={classes}>{children}</Tag>;
};

export { Typography };
