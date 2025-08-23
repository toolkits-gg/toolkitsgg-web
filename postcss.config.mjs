const config = {
  plugins: {
    'postcss-preset-mantine': {},
    'postcss-simple-vars': {
      //! Any changes to these breakpoints must also be made to the `BREAKPOINTS` variable
      //! in `themes/constants.ts`.
      variables: {
        'mantine-breakpoint-xs': '36em',
        'mantine-breakpoint-sm': '48em',
        'mantine-breakpoint-md': '62em',
        'mantine-breakpoint-lg': '75em',
        'mantine-breakpoint-xl': '88em',
      },
    },
  },
};

export default config;
