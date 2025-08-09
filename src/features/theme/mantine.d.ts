import { Tuple, DefaultMantineColor } from '@mantine/core';

type ExtendedCustomColors =
  | 'primary'
  | 'secondary'
  | 'accent1'
  | 'bg'
  | 'cardBg'
  | 'sidebarBg'
  | 'border'
  | 'ring'
  | DefaultMantineColor;

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedCustomColors, Tuple<string, 10>>;
  }
}
