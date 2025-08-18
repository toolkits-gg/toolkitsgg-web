'use client';

import {
  Button,
  Dialog,
  Flex,
  type MantineColorScheme,
  Select,
  Tooltip,
  useMantineColorScheme,
} from '@mantine/core';
import { upperFirst, useDisclosure } from '@mantine/hooks';
import { IconPalette } from '@tabler/icons-react';
import { useAtom } from 'jotai';
import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useMemo, useState } from 'react';
import { mantineThemeAtom } from '@/features/theme/atoms';
import {
  accentThemeDefinitions,
  allThemeDefinitions,
  themeModes,
} from '@/features/theme/constants';
import { themeUtils } from '@/features/theme/utils';

const ThemeChanger = () => {
  const [dialogOpen, { toggle, close }] = useDisclosure(false);

  const { colorScheme: _colorScheme, setColorScheme } = useMantineColorScheme();

  const { theme: nextTheme, setTheme: setNextTheme } = useNextTheme();
  const [mode, setMode] = useState<MantineColorScheme>('auto');

  const accent = useMemo(
    () => themeUtils.parseAccent({ nextTheme }),
    [nextTheme]
  );

  const [_mantineTheme, setMantineTheme] = useAtom(mantineThemeAtom);

  // We compute the mantine theme ourselves based on the next-theme,
  // since the mantineThemeAtom cannot be initialized automatically
  // with this value.
  // We then watch for changes to the nextTheme or accent and update
  // the Mantine theme accordingly.
  const mantineTheme = useMemo(
    () => themeUtils.chooseMantineTheme({ nextTheme, accent }),
    [accent, nextTheme]
  );

  // Sync the mantineTheme atom with the next-themes value
  useEffect(() => {
    setMantineTheme(mantineTheme);
  }, [mantineTheme, setMantineTheme]);

  const handleChangeNextTheme = (value: string | null) => {
    let newNextTheme = value ?? 'default-dark';
    if (accent !== 'accent-default') {
      newNextTheme = `${newNextTheme}-${accent}`;
    }

    const newColorScheme = newNextTheme.includes('-light') ? 'light' : 'dark';
    if (mode !== newColorScheme) {
      newNextTheme = newNextTheme.replace(mode, newColorScheme);
      setColorScheme(newColorScheme);
    }
    setNextTheme(newNextTheme);
  };

  const handleChangeMode = (value: string | null) => {
    if (!value) return;
    if (!nextTheme) return;

    const assertedValue = value as MantineColorScheme;

    setMode(assertedValue);
    setColorScheme(assertedValue);

    if (assertedValue === 'light') {
      setNextTheme(nextTheme?.replace('-dark', '-light'));
    }
    if (assertedValue === 'dark') {
      setNextTheme(nextTheme?.replace('-light', '-dark'));
    }
  };

  const handleChangeAccent = (value: string | null) => {
    if (!value) return;
    if (!nextTheme) return;

    if (value === 'accent-default') {
      const newNextTheme = nextTheme.split('-accent-')[0];
      setNextTheme(newNextTheme);
    } else {
      // Remove all existing accent values
      let newNextTheme = nextTheme;
      for (const def of accentThemeDefinitions) {
        newNextTheme = newNextTheme.replace(`-${def.className}`, '');
      }

      setNextTheme(`${newNextTheme}-${value}`);
    }
  };

  return (
    <>
      <Tooltip label="Change theme settings">
        <Button
          onClick={toggle}
          aria-label="Theme settings"
          color="primary.5"
          variant="filled"
          size="compact-md"
        >
          <IconPalette />
        </Button>
      </Tooltip>
      <Dialog
        opened={dialogOpen}
        withCloseButton
        onClose={close}
        size="lg"
        radius="md"
        bg="var(--mantine-color-card-bg-5)"
        bd="1px solid var(--mantine-color-border-6)"
      >
        <Flex
          align="center"
          justify="space-between"
          gap="md"
          direction="column"
        >
          <Flex gap="md" align="center" justify="space-between">
            <Select
              label="Select mode"
              data={themeModes.map((tm) => ({
                label: tm === 'auto' ? 'All' : upperFirst(tm),
                value: tm,
              }))}
              value={mode}
              onChange={handleChangeMode}
            />
            <Select
              label="Select accent"
              value={accent}
              data={accentThemeDefinitions.map((def) => ({
                label: def.label,
                value: def.className,
              }))}
              onChange={handleChangeAccent}
            />
          </Flex>
          <Flex w="100%" align="center" justify="center">
            <Select
              label="Select theme"
              value={nextTheme?.split('-accent')[0]}
              data={allThemeDefinitions.map((def) => ({
                label: def.label,
                value: def.className,
              }))}
              onChange={handleChangeNextTheme}
            />
          </Flex>
        </Flex>
      </Dialog>
    </>
  );
};

export { ThemeChanger };
