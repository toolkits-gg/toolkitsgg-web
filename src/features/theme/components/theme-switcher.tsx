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
  const {
    theme,
    selectedMode,
    handleChangeTheme,
    handleChangeMode,
    selectedAccent,
    handleChangeAccent,
  } = useAppTheme();
  const isClient = useIsClient();

  const [dialogOpen, setDialogOpen] = useState(false);

  if (!theme) {
    return <Skeleton className="h-9 w-9" />;
  }
  if (!isClient) {
    return <Skeleton className="h-9 w-9" />;
  }

  return (
    <>
      <Button
        color="dark"
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
              name="selectedMode"
              onChange={handleChangeMode}
              value={selectedMode}
            >
              {themeModes.map((selectedMode) => (
                <ListboxOption key={selectedMode} value={selectedMode}>
                  <ListboxLabel>{selectedMode}</ListboxLabel>
                </ListboxOption>
              ))}
            </Listbox>
          </Field>

          <Field>
            <Label>Accents</Label>
            <Listbox
              name="selectedAccent"
              onChange={handleChangeAccent}
              value={selectedAccent}
            >
              {accentThemeDefinitions.map((def) => (
                <ListboxOption key={def.className} value={def.accentTheme}>
                  <ListboxLabel>{def.label}</ListboxLabel>
                </ListboxOption>
              ))}
            </Listbox>
          </Field>

          <Field>
            <Label>Theme</Label>
            <Listbox
              name="colorTheme"
              onChange={handleChangeTheme}
              placeholder="Select a new theme"
              value={theme}
            >
              {allThemeClassDefinitions.map((def) => (
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
