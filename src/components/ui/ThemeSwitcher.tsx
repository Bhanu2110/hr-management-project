import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Palette, Sun, Moon } from 'lucide-react';

export function ThemeSwitcher() {
  const { setThemeColor, themeMode, setThemeMode } = useTheme();

  const colors = {
    Orange: '#E15B55',
    Blue: '#3B82F6',
    Green: '#10B981',
    Purple: '#8B5CF6',
    Black: '#000000',
    Red: '#EF4444',
    Pink: '#EC4899',
    Grey: '#6B7280',
    "Mitchell Adam": '#4CAF50', // Placeholder green
    Practipago: '#2196F3',   // Placeholder blue
    YouEngage: '#FF9800',    // Placeholder orange
    KeyNest: '#BF3436',
    "JP Teaches Photo": '#F4A261',
    "Melyssa Griffin": '#FF6B6B',
    "Lemon Tree Editorial": '#7CB342', // Placeholder green
    "Katie Lemon": '#FFD700',      // Placeholder gold
    "Alejandro Castro": '#800080',   // Placeholder purple
    Scarlet: '#FF2400',            // Placeholder scarlet red
    CitrusAd: '#FFA500',           // Placeholder orange
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Palette className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-60 overflow-y-auto">
        <DropdownMenuLabel>Color Theme</DropdownMenuLabel>
        {Object.entries(colors).map(([name, color]) => (
          <DropdownMenuItem key={name} onClick={() => setThemeColor(color)}>
            <span
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: color }}
            ></span>
            {name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Interface Theme</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setThemeMode('light')}>
          <Sun className="h-4 w-4 mr-2" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setThemeMode('dark')}>
          <Moon className="h-4 w-4 mr-2" />
          Dark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
