'use client';

import { useEffect, useState } from 'react';
import { useIsClient } from 'usehooks-ts';
import {
  accentThemeDefinitions,
  allThemeDefinitions,
  themeModes,
} from '@/features/theme/constants';
import {
  Button,
  Dialog,
  Flex,
  Select,
  Skeleton,
  Tooltip,
  useMantineColorScheme,
  type MantineColorScheme,
} from '@mantine/core';
import { IconPalette } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useTheme as useNextTheme } from 'next-themes';
import { capitalize } from '@/utils/capitalize';
import { allGameConfigs } from '@/features/game/constants';
import { useAtom } from 'jotai';
import { mantineThemeAtom } from '@/features/theme/atoms';
import { defaultTheme } from '@/features/theme/themes/default-theme';

const ThemeChanger = () => {
  const [dialogOpen, { toggle, close }] = useDisclosure(false);
  const isClient = useIsClient();

  const { colorScheme, setColorScheme } = useMantineColorScheme();

  const { theme: nextTheme, setTheme: setNextTheme } = useNextTheme();
  const [mode, setMode] = useState<MantineColorScheme>('auto');

  const [mantineTheme, setMantineTheme] = useAtom(mantineThemeAtom);

  useEffect(() => {
    if (!nextTheme) return;

    console.info(nextTheme);

    if (nextTheme === 'default-dark' || nextTheme === 'default-light') {
      console.info('Using default theme');
      setMantineTheme(defaultTheme);
      return;
    }

    const gameConfig = allGameConfigs.find(
      (config) =>
        config.themeDefinition &&
        nextTheme.includes(config.themeDefinition.className)
    );

    if (gameConfig?.themeDefinition) {
      setMantineTheme(gameConfig.themeDefinition.theme);
    }
  }, [nextTheme]);

  if (!colorScheme) {
    return <Skeleton height={36} />;
  }
  if (!isClient) {
    return <Skeleton height={36} />;
  }

  const accent = nextTheme?.includes('-accent')
    ? nextTheme.slice(nextTheme.indexOf('-accent') + 1)
    : 'accent-default';

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

    const gameConfig = allGameConfigs.find(
      (gameConfig) => gameConfig.themeDefinition?.className === newNextTheme
    );

    if (!gameConfig || !gameConfig.themeDefinition?.theme) {
      setMantineTheme(defaultTheme);
      return;
    }

    setMantineTheme(gameConfig.themeDefinition.theme);
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
      // TODO Set Mantine Theme
    } else {
      setNextTheme(`${nextTheme}-${value}`);
      // TODO Set Mantine Theme
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
                label: tm === 'auto' ? 'All' : capitalize(tm),
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
