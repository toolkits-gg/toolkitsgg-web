'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  let colorScheme: 'light' | 'dark' | 'system' = 'system';
  if (theme?.endsWith('-dark')) {
    colorScheme = 'dark';
  } else if (theme) {
    colorScheme = theme === 'system' ? 'system' : 'light';
  }

  return (
    <Sonner
      theme={colorScheme}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
