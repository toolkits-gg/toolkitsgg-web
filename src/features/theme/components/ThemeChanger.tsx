'use client';

import { useState } from 'react';
import { useIsClient } from 'usehooks-ts';
import { themeModes } from '@/features/theme/constants';
import { useAppTheme } from '@/features/theme/hooks/use-app-theme';
import { Button, Dialog, Skeleton } from '@mantine/core';
import { IconPalette } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

const ThemeChanger = () => {
  const { colorTheme, accent, handleChangeTheme } = useAppTheme();
  const isClient = useIsClient();

  const [dialogOpen, { toggle, close }] = useDisclosure(false);

  const [category, setCategory] = useState<(typeof themeModes)[number]>('All');

  if (!colorTheme) {
    return <Skeleton height={36} />;
  }
  if (!isClient) {
    return <Skeleton height={36} />;
  }

  const handleChangeColorTheme = (newColorTheme: string) => {
    //handleChangeTheme(newColorTheme, accent);
  };

  const handleChangeCategory = (value: typeof category) => {
    setCategory(value);
  };

  const handleChangeAccent = (newAccent: string) => {
    //handleChangeTheme(colorTheme, newAccent);
  };

  return (
    <>
      <Button onClick={toggle} aria-label="Theme settings" color="primary.5">
        <IconPalette />
      </Button>
      <Dialog
        opened={dialogOpen}
        withCloseButton
        onClose={close}
        size="lg"
        radius="md"
      >
        Test
      </Dialog>
      {/* <Dialog
        onClose={() => {
          setDialogOpen(false);
        }}
        open={dialogOpen}
      >
        <DialogTitle>Select Color Theme</DialogTitle>
        <DialogBody className="flex flex-col gap-y-4">
          <div className="flex flex-1 items-center justify-between gap-x-2">
            <Field className="w-full">
              <Label>Category</Label>
              <Listbox
                name="selectedCategory"
                onChange={handleChangeCategory}
                value={category}
              >
                {themeModes.map((themeMode) => (
                  <ListboxOption key={themeMode} value={themeMode}>
                    <ListboxLabel>{themeMode}</ListboxLabel>
                  </ListboxOption>
                ))}
              </Listbox>
            </Field>
            <Field className="w-full">
              <Label>Accents</Label>
              <Listbox
                name="selectedAccent"
                onChange={handleChangeAccent}
                value={accent}
              >
                {accentThemeDefinitions.map((def) => (
                  <ListboxOption key={def.className} value={def.className}>
                    <ListboxLabel>{def.label}</ListboxLabel>
                  </ListboxOption>
                ))}
              </Listbox>
            </Field>
          </div>

          <Divider />

          <Field>
            <Label>Theme</Label>
            <Listbox
              name="colorTheme"
              onChange={handleChangeColorTheme}
              placeholder="Select a new theme"
              value={colorTheme}
            >
              {allThemeClassDefinitions
                .filter((def) => {
                  switch (category) {
                    case 'All':
                      return true;
                    case 'Light':
                      return def.className.includes('light');
                    case 'Dark':
                      return def.className.includes('dark');
                    default:
                      return false;
                  }
                })
                .map((def) => (
                  <ListboxOption key={def.className} value={def.className}>
                    <ListboxLabel>{def.label}</ListboxLabel>
                  </ListboxOption>
                ))}
            </Listbox>
          </Field>
        </DialogBody>
      </Dialog> */}
    </>
  );
};

export { ThemeChanger };
