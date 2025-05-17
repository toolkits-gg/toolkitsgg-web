export const themes = [
  'cyan',
  'green',
  'orange',
  'pink',
  'purple',
  'red',
  'yellow'
] as const;

export type ThemeName = (typeof themes)[number];

/**
 * Used to show the theme color in the color picker.
 *
 * Use the calculator at https://oklch.com/ to convert the --primary color
 * to hex code.
 */
export const themePrimaryColors: Record<ThemeName, string> = {
  cyan: 'bg-[#33aaf3] hover:bg-[#1a8bbf]',
  green: 'bg-[#4bb465] hover:bg-[#3a9b4b]',
  orange: 'bg-[#f38435] hover:bg-[#d76a2a]',
  pink: 'bg-[#f335e0] hover:bg-[#d024b0]',
  purple: 'bg-[#8136f3] hover:bg-[#6b2fbc]',
  red: 'bg-[#f33533] hover:bg-[#d02424]',
  yellow: 'bg-[#ecdf69] hover:bg-[#d1c95a]'
};
