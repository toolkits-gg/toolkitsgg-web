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
import { useEffect, useState } from 'react';
import { allGameConfigs } from '@/features/game/constants';
import { mantineThemeAtom } from '@/features/theme/atoms';
import {
  accentThemeDefinitions,
  allThemeDefinitions,
  themeModes,
} from '@/features/theme/constants';
import {
  defaultTheme,
  defaultThemeDeuteranopia,
  defaultThemeProtanopia,
} from '@/features/theme/themes/default-theme';

// TODO currently the default accent is not applied on page load
// TODO additionally, changing the accent theme from default to accent does not work the first time
// TODO it works changing from accent to accent though

const ThemeChanger = () => {
  const [dialogOpen, { toggle, close }] = useDisclosure(false);

  const { colorScheme: _colorScheme, setColorScheme } = useMantineColorScheme();

  const { theme: nextTheme, setTheme: setNextTheme } = useNextTheme();
  const [mode, setMode] = useState<MantineColorScheme>('auto');

  const [_mantineTheme, setMantineTheme] = useAtom(mantineThemeAtom);

  const accent = nextTheme?.includes('-accent')
    ? nextTheme.slice(nextTheme.indexOf('-accent') + 1)
    : 'accent-default';

  useEffect(() => {
    if (!nextTheme) {
      console.info(`No nextTheme set, defaulting}`);
      return;
    }

    if (nextTheme === 'default-dark' || nextTheme === 'default-light') {
      if (accent === 'accent-deuteranopic') {
        console.info(`settingTheme to default deuteranopia`);
        setMantineTheme(defaultThemeDeuteranopia);
        return;
      }

      if (accent === 'accent-protanopic') {
        console.info(`settingTheme to default protanopia`);
        setMantineTheme(defaultThemeProtanopia);
        return;
      }

      console.info(`settingTheme to default`);
      setMantineTheme(defaultTheme);
      return;
    }

    const gameConfig = allGameConfigs.find(
      (config) =>
        config.themeDefinition &&
        nextTheme.includes(config.themeDefinition.className)
    );

    if (gameConfig?.themeDefinition) {
      if (accent === 'accent-deuteranopic') {
        console.info(
          `settingTheme to ${gameConfig.themeDefinition.className} deuteranopia`
        );
        setMantineTheme(gameConfig.themeDefinition.themeDeuteranopia);
        return;
      }

      if (accent === 'accent-protanopic') {
        console.info(
          `settingTheme to ${gameConfig.themeDefinition.className} protanopia`
        );
        setMantineTheme(gameConfig.themeDefinition.themeProtanopia);
        return;
      }

      console.info(`settingTheme to ${gameConfig.themeDefinition.className}`);
      setMantineTheme(gameConfig.themeDefinition.theme);
    }
  }, [nextTheme, accent, setMantineTheme]);

  // if (!colorScheme) {
  //   return <Skeleton height={36} />;
  // }
  // if (!isClient) {
  //   return <Skeleton height={36} />;
  // }

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
      if (accent === 'accent-deuteranopic') {
        setMantineTheme(defaultThemeDeuteranopia);
        return;
      }

      if (accent === 'accent-protanopic') {
        setMantineTheme(defaultThemeProtanopia);
        return;
      }

      setMantineTheme(defaultTheme);
      return;
    }

    if (accent === 'accent-deuteranopic') {
      setMantineTheme(gameConfig.themeDefinition.themeDeuteranopia);
      return;
    }

    if (accent === 'accent-protanopic') {
      setMantineTheme(gameConfig.themeDefinition.themeProtanopia);
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
    } else {
      // Remove all existing accent values
      let newNextTheme = nextTheme;
      for (const def of accentThemeDefinitions) {
        newNextTheme = newNextTheme.replace(`-${def.className}`, '');
      }

      setNextTheme(`${newNextTheme}-${value}`);

      const gameConfig = allGameConfigs.find(
        (gameConfig) => gameConfig.themeDefinition?.className === newNextTheme
      );

      if (!gameConfig || !gameConfig.themeDefinition?.theme) {
        if (accent === 'accent-deuteranopic') {
          setMantineTheme(defaultThemeDeuteranopia);
          return;
        }

        if (accent === 'accent-protanopic') {
          setMantineTheme(defaultThemeProtanopia);
          return;
        }

        setMantineTheme(defaultTheme);
        return;
      }

      if (accent === 'accent-deuteranopic') {
        setMantineTheme(gameConfig.themeDefinition.themeDeuteranopia);
        return;
      }

      if (accent === 'accent-protanopic') {
        setMantineTheme(gameConfig.themeDefinition.themeProtanopia);
        return;
      }

      setMantineTheme(gameConfig.themeDefinition.theme);
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
