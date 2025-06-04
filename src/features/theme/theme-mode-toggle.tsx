'use client';
import { LucideMoon, LucideSun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ThemeModeToggle = () => {
  const { theme, setTheme } = useTheme();

  const handleLightMode = () => {
    if (!theme) return;
    // If the current theme has '-dark', remove it
    setTheme(theme.replace('-dark', ''));
  };

  const handleDarkMode = () => {
    if (!theme) return;
    // If the current theme does not have '-dark', append it
    if (theme.indexOf('-dark') === -1) {
      setTheme(`${theme}-dark`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <LucideSun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <LucideMoon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleLightMode}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={handleDarkMode}>Dark</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ThemeModeToggle };
