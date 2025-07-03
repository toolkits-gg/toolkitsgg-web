'use client';

import { LucidePalette } from 'lucide-react';
import { useState } from 'react';
import { useIsClient } from 'usehooks-ts';
import { Button } from '@/components/button';
import { Dialog, DialogBody, DialogTitle } from '@/components/dialog';
import { Divider } from '@/components/divider';
import { Field, Label } from '@/components/fieldset';
import { Listbox, ListboxLabel, ListboxOption } from '@/components/listbox';
import { Skeleton } from '@/components/skeleton';
import {
  accentThemeDefinitions,
  allThemeClassDefinitions,
  themeModes,
} from '@/features/theme/constants';
import { useAppTheme } from '@/features/theme/hooks/use-theme';

const ThemeSwitcher = () => {
  const { colorTheme, accent, handleChangeTheme } = useAppTheme();
  const isClient = useIsClient();

  const [dialogOpen, setDialogOpen] = useState(false);

  const [category, setCategory] = useState<(typeof themeModes)[number]>('All');

  if (!colorTheme) {
    return <Skeleton className="h-9 w-9" />;
  }
  if (!isClient) {
    return <Skeleton className="h-9 w-9" />;
  }

  const handleChangeColorTheme = (newColorTheme: string) => {
    handleChangeTheme(newColorTheme, accent);
  };

  const handleChangeCategory = (value: typeof category) => {
    setCategory(value);
  };

  const handleChangeAccent = (newAccent: string) => {
    handleChangeTheme(colorTheme, newAccent);
  };

  return (
    <>
      <Button
        plain
        onClick={() => {
          setDialogOpen(!dialogOpen);
        }}
      >
        <LucidePalette className="h-5 w-5" />
      </Button>
      <Dialog
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
      </Dialog>
    </>
  );
};

export { ThemeSwitcher };
