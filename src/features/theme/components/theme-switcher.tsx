'use client';

import { LucidePalette } from 'lucide-react';
import { useState } from 'react';
import { useIsClient } from 'usehooks-ts';
import { Button } from '@/components/button';
import { Dialog, DialogBody, DialogTitle } from '@/components/dialog';
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
        color="primary"
        onClick={() => {
          setDialogOpen(!dialogOpen);
        }}
      >
        <LucidePalette />
      </Button>
      <Dialog
        onClose={() => {
          setDialogOpen(false);
        }}
        open={dialogOpen}
      >
        <DialogTitle>Select Color Theme</DialogTitle>
        <DialogBody className="ui-flex ui-flex-col ui-gap-y-4">
          <Field>
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

          <Field>
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
