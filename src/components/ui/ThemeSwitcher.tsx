import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Palette } from 'lucide-react';

export function ThemeSwitcher() {
  const { setThemeColor } = useTheme();

  const colors = {
    Orange: '#E15B55',
    Blue: '#3B82F6',
    Green: '#10B981',
    Purple: '#8B5CF6',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Palette className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(colors).map(([name, color]) => (
          <DropdownMenuItem key={name} onClick={() => setThemeColor(color)}>
            <span
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: color }}
            ></span>
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
