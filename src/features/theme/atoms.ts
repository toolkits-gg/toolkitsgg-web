import { MantineThemeOverride } from '@mantine/core';
import { atom } from 'jotai';
import { defaultTheme } from '@/features/theme/themes/default-theme';

export const mantineThemeAtom = atom<MantineThemeOverride>(defaultTheme);
