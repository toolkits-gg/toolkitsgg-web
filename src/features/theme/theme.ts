import {
  Card,
  Container,
  createTheme,
  Paper,
  rem,
  Select,
  virtualColor,
} from '@mantine/core';
import type { MantineThemeOverride } from '@mantine/core';

const CONTAINER_SIZES: Record<string, string> = {
  xxs: rem('200px'),
  xs: rem('300px'),
  sm: rem('400px'),
  md: rem('500px'),
  lg: rem('600px'),
  xl: rem('1400px'),
  xxl: rem('1600px'),
};

export const defaultTheme: MantineThemeOverride = createTheme({
  colors: {
    primaryDark: [
      '#7201d3',
      '#7201d3',
      '#7201d3',
      '#7201d3',
      '#7201d3',
      '#7201d3',
      '#7201d3',
      '#7201d3',
      '#7201d3',
      '#7201d3',
    ],
    // TODO
    primaryLight: ['', '', '', '', '', '', '', '', '', ''],
    primary: virtualColor({
      name: 'primary',
      dark: 'primaryDark',
      light: 'primaryLight',
    }),

    secondaryDark: [
      '#ff9e01',
      '#ff9e01',
      '#ff9e01',
      '#ff9e01',
      '#ff9e01',
      '#ff9e01',
      '#ff9e01',
      '#ff9e01',
      '#ff9e01',
      '#ff9e01',
    ],
    // TODO
    secondaryLight: ['', '', '', '', '', '', '', '', '', ''],
    secondary: virtualColor({
      name: 'secondary',
      dark: 'secondaryDark',
      light: 'secondaryLight',
    }),

    accent1Dark: [
      '#4a86e8',
      '#4a86e8',
      '#4a86e8',
      '#4a86e8',
      '#4a86e8',
      '#4a86e8',
      '#4a86e8',
      '#4a86e8',
      '#4a86e8',
      '#4a86e8',
    ],
    accent1Light: ['', '', '', '', '', '', '', '', '', ''],
    accent1: virtualColor({
      name: 'accent1',
      dark: 'accent1Dark',
      light: 'accent1Light',
    }),

    sidebarBgDark: [
      '#171221',
      '#171221',
      '#171221',
      '#171221',
      '#171221',
      '#171221',
      '#171221',
      '#171221',
      '#171221',
      '#171221',
    ],
    sidebarBgLight: [
      '#fbfbfb',
      '#fbfbfb',
      '#fbfbfb',
      '#fbfbfb',
      '#fbfbfb',
      '#fbfbfb',
      '#fbfbfb',
      '#fbfbfb',
      '#fbfbfb',
      '#fbfbfb',
    ],
    sidebarBg: virtualColor({
      name: 'sidebar-bg',
      dark: 'sidebarBgDark',
      light: 'sidebarBgLight',
    }),
  },
  /** Put your mantine theme override here */
  fontSizes: {
    xs: rem('12px'),
    sm: rem('14px'),
    md: rem('16px'),
    lg: rem('18px'),
    xl: rem('20px'),
    '2xl': rem('24px'),
    '3xl': rem('30px'),
    '4xl': rem('36px'),
    '5xl': rem('48px'),
  },
  spacing: {
    '3xs': rem('4px'),
    '2xs': rem('8px'),
    xs: rem('10px'),
    sm: rem('12px'),
    md: rem('16px'),
    lg: rem('20px'),
    xl: rem('24px'),
    '2xl': rem('28px'),
    '3xl': rem('32px'),
  },
  primaryColor: 'primary',
  components: {
    /** Put your mantine component override here */
    Container: Container.extend({
      vars: (_, { size, fluid }) => ({
        root: {
          '--container-size': fluid
            ? '100%'
            : size !== undefined && size in CONTAINER_SIZES
              ? CONTAINER_SIZES[size]
              : rem(size),
        },
      }),
    }),
    Paper: Paper.extend({
      defaultProps: {
        p: 'md',
        shadow: 'xl',
        radius: 'md',
        withBorder: true,
      },
    }),

    Card: Card.extend({
      defaultProps: {
        p: 'xl',
        shadow: 'xl',
        radius: 'var(--mantine-radius-default)',
        withBorder: true,
      },
    }),
    Select: Select.extend({
      defaultProps: {
        checkIconPosition: 'right',
      },
    }),
  },
  other: {
    style: 'mantine',
  },
});
