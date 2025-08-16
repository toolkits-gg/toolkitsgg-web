import { defaultTheme } from '@/features/theme/themes/default-theme';
import { MantineThemeOverride } from '@mantine/core';
import { atom } from 'jotai';

export const mantineThemeAtom = atom<MantineThemeOverride>(defaultTheme);
